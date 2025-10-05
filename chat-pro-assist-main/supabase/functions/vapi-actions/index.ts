import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPI_PRIVATE_KEY = Deno.env.get('VAPI_PRIVATE_KEY');
    if (!VAPI_PRIVATE_KEY) {
      throw new Error('VAPI_PRIVATE_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'create-assistant': {
        const response = await fetch('https://api.vapi.ai/assistant', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            model: {
              provider: 'openai',
              model: data.model || 'gpt-3.5-turbo',
              temperature: data.temperature || 0.7,
              messages: [
                {
                  role: 'system',
                  content: data.prompt || 'You are a helpful assistant.',
                },
              ],
            },
            voice: {
              provider: data.voice_provider || 'playht',
              voiceId: data.voice_id || 'jennifer',
            },
            firstMessage: data.first_message || 'Hello! How can I help you today?',
          }),
        });

        const vapiAssistant = await response.json();

        if (!response.ok) {
          throw new Error(vapiAssistant.message || 'Failed to create assistant');
        }

        // Save to database
        const { data: assistant, error } = await supabase
          .from('assistants')
          .insert({
            vapi_assistant_id: vapiAssistant.id,
            name: data.name,
            description: data.description,
            prompt: data.prompt,
            voice_provider: data.voice_provider,
            voice_id: data.voice_id,
            model: data.model,
            temperature: data.temperature,
            first_message: data.first_message,
            preset_type: data.preset_type || 'custom',
            owner_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(assistant), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'make-call': {
        const response = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantId: data.assistantId,
            customer: {
              number: data.phoneNumber,
              name: data.callerName,
            },
            ...(data.customMessage && { 
              assistant: {
                firstMessage: data.customMessage
              }
            }),
          }),
        });

        const callData = await response.json();

        if (!response.ok) {
          throw new Error(callData.message || 'Failed to make call');
        }

        // Create call record
        const { data: call, error } = await supabase
          .from('calls')
          .insert({
            vapi_call_id: callData.id,
            phone_number: data.phoneNumber,
            caller_name: data.callerName,
            direction: 'outbound',
            status: 'queued',
            assistant_id: data.assistantId,
            lead_id: data.leadId,
            owner_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(call), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-calls': {
        const { data: calls, error } = await supabase
          .from('calls')
          .select('*, leads(name, email, company)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(data.limit || 50);

        if (error) throw error;

        return new Response(JSON.stringify(calls), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-call-metrics': {
        const { data: calls, error } = await supabase
          .from('calls')
          .select('*')
          .eq('owner_id', user.id);

        if (error) throw error;

        const total = calls.length;
        const completed = calls.filter(c => c.status === 'completed').length;
        const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
        const totalCost = calls.reduce((sum, c) => sum + (parseFloat(c.cost || '0')), 0);
        const successRate = total > 0 ? (completed / total) * 100 : 0;

        const sentiments = calls.reduce((acc, c) => {
          if (c.sentiment) acc[c.sentiment] = (acc[c.sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return new Response(JSON.stringify({
          totalCalls: total,
          completedCalls: completed,
          avgDuration: total > 0 ? Math.round(totalDuration / total) : 0,
          totalCost: totalCost.toFixed(2),
          avgCost: total > 0 ? (totalCost / total).toFixed(2) : '0.00',
          successRate: successRate.toFixed(1),
          sentiments,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'test-connection': {
        try {
          const testResponse = await fetch('https://api.vapi.ai/assistant', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
            },
          });
          
          return new Response(
            JSON.stringify({ connected: testResponse.ok }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ connected: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'get-phone-numbers': {
        try {
          const response = await fetch('https://api.vapi.ai/phone-number', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch phone numbers');
          }

          const phoneNumbers = await response.json();
          
          return new Response(
            JSON.stringify({ phoneNumbers }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error fetching phone numbers:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch phone numbers', phoneNumbers: [] }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'assign-assistant-to-number': {
        const { phoneNumberId, assistantId } = data;
        
        try {
          const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ assistantId }),
          });

          if (!response.ok) {
            throw new Error('Failed to assign assistant');
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error assigning assistant:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to assign assistant' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'create-phone-number': {
        try {
          const response = await fetch('https://api.vapi.ai/phone-number', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'vapi',
              fallbackDestination: {
                type: 'number',
                number: data.areaCode,
              },
              name: `Number ${data.areaCode}`,
              serverUrl: 'https://kprydlijsjygdpuoylwj.supabase.co/functions/v1/vapi-webhook',
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create phone number: ${error}`);
          }

          return new Response(JSON.stringify(await response.json()), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error creating phone number:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'delete-phone-number': {
        try {
          const response = await fetch(`https://api.vapi.ai/phone-number/${data.phoneNumberId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
            },
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to delete phone number: ${error}`);
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error deleting phone number:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'update-phone-number': {
        try {
          const { phoneNumberId, name, assistantId, serverUrl, credential, noAuthentication } = data;
          
          // Build the update payload with only valid Vapi properties
          const updatePayload: any = {};
          
          if (name) updatePayload.name = name;
          if (assistantId) updatePayload.assistantId = assistantId;
          
          // Add server configuration if provided
          if (serverUrl) {
            updatePayload.serverUrl = serverUrl;
            updatePayload.serverUrlSecret = credential || '';
          }
          
          console.log('Updating phone number:', phoneNumberId, 'with payload:', updatePayload);
          
          const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Vapi API error:', response.status, errorText);
            throw new Error(`Failed to update phone number: ${errorText}`);
          }

          const phoneNumber = await response.json();
          console.log('Phone number updated successfully:', phoneNumber);
          
          return new Response(
            JSON.stringify(phoneNumber),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error updating phone number:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'get-phone-number-analytics': {
        try {
          const { phoneNumberId } = data;
          
          // Get calls for this phone number
          const { data: calls, error } = await supabase
            .from('calls')
            .select('*')
            .eq('phone_number', phoneNumberId)
            .eq('owner_id', user.id);

          if (error) throw error;

          const total = calls.length;
          const completed = calls.filter(c => c.status === 'completed').length;
          const avgDuration = total > 0 ? calls.reduce((sum, c) => sum + (c.duration || 0), 0) / total : 0;
          
          return new Response(
            JSON.stringify({
              totalCalls: total,
              completedCalls: completed,
              avgDuration: Math.round(avgDuration),
              recentCalls: calls.slice(0, 10),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error fetching analytics:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
