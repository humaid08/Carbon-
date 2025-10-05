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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('Received Vapi webhook:', payload.type);

    const { message } = payload;

    switch (message?.type) {
      case 'call-start': {
        console.log('Call started:', message);
        
        // Create call record
        const { data: call, error } = await supabase
          .from('calls')
          .insert({
            vapi_call_id: message.call?.id,
            phone_number: message.call?.customer?.number,
            caller_name: message.call?.customer?.name,
            direction: message.call?.type,
            status: 'in-progress',
            start_time: new Date().toISOString(),
            assistant_id: message.call?.assistantId,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating call:', error);
        } else {
          console.log('Call created:', call);
        }
        break;
      }

      case 'transcript': {
        console.log('Transcript update:', message);
        
        // Find call by vapi_call_id
        const { data: calls } = await supabase
          .from('calls')
          .select('id, transcript')
          .eq('vapi_call_id', message.call?.id)
          .single();

        if (calls) {
          const existingTranscript = calls.transcript || '';
          const newTranscript = `${existingTranscript}\n${message.transcript?.role}: ${message.transcript?.text}`.trim();

          await supabase
            .from('calls')
            .update({ transcript: newTranscript })
            .eq('id', calls.id);

          // Log event
          await supabase
            .from('call_events')
            .insert({
              call_id: calls.id,
              event_type: 'transcript',
              data: message.transcript,
            });
        }
        break;
      }

      case 'call-end': {
        console.log('Call ended:', message);
        
        const { data: call } = await supabase
          .from('calls')
          .select('*')
          .eq('vapi_call_id', message.call?.id)
          .single();

        if (call) {
          const endTime = new Date();
          const duration = call.start_time 
            ? Math.floor((endTime.getTime() - new Date(call.start_time).getTime()) / 1000)
            : 0;

          // Update call with final details
          await supabase
            .from('calls')
            .update({
              status: 'completed',
              end_time: endTime.toISOString(),
              duration,
              recording_url: message.call?.recordingUrl,
              cost: message.call?.cost,
            })
            .eq('id', call.id);

          // Generate AI summary using Gemini
          if (call.transcript) {
            try {
              const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
              
              const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are an AI assistant that analyzes call transcripts. Provide a concise summary, identify the sentiment (positive/neutral/negative), extract lead information (name, email, company, interest, budget), and list action items.'
                    },
                    {
                      role: 'user',
                      content: `Analyze this call transcript and provide:\n1. Summary (2-3 sentences)\n2. Sentiment (positive/neutral/negative)\n3. Lead info (name, email, company, interest, budget if mentioned)\n4. Action items\n\nTranscript:\n${call.transcript}`
                    }
                  ],
                }),
              });

              const summaryData = await summaryResponse.json();
              const aiAnalysis = summaryData.choices?.[0]?.message?.content;

              if (aiAnalysis) {
                // Parse sentiment from analysis
                const sentimentMatch = aiAnalysis.toLowerCase().match(/sentiment[:\s]+(positive|neutral|negative)/);
                const sentiment = sentimentMatch ? sentimentMatch[1] : 'neutral';

                await supabase
                  .from('calls')
                  .update({
                    ai_summary: aiAnalysis,
                    sentiment: sentiment,
                  })
                  .eq('id', call.id);

                // Try to extract lead information and create/update lead
                const phoneMatch = call.phone_number;
                if (phoneMatch) {
                  // Check if lead exists
                  const { data: existingLead } = await supabase
                    .from('leads')
                    .select('id')
                    .eq('phone', phoneMatch)
                    .single();

                  if (!existingLead) {
                    // Create new lead
                    const { data: newLead } = await supabase
                      .from('leads')
                      .insert({
                        name: call.caller_name || 'Unknown',
                        phone: phoneMatch,
                        source: 'phone',
                        status: 'contacted',
                        owner_id: call.owner_id,
                      })
                      .select()
                      .single();

                    if (newLead) {
                      await supabase
                        .from('calls')
                        .update({ lead_id: newLead.id })
                        .eq('id', call.id);
                    }
                  } else {
                    await supabase
                      .from('calls')
                      .update({ lead_id: existingLead.id })
                      .eq('id', call.id);
                  }
                }
              }
            } catch (error) {
              console.error('Error generating AI summary:', error);
            }
          }

          // Log event
          await supabase
            .from('call_events')
            .insert({
              call_id: call.id,
              event_type: 'call-ended',
              data: message.call,
            });
        }
        break;
      }

      case 'function-call': {
        console.log('Function call:', message);
        
        const { data: call } = await supabase
          .from('calls')
          .select('id')
          .eq('vapi_call_id', message.call?.id)
          .single();

        if (call) {
          await supabase
            .from('call_events')
            .insert({
              call_id: call.id,
              event_type: 'function-call',
              data: message.functionCall,
            });
        }
        break;
      }

      case 'status-update': {
        console.log('Status update:', message);
        
        const { data: call } = await supabase
          .from('calls')
          .select('id')
          .eq('vapi_call_id', message.call?.id)
          .single();

        if (call) {
          let status = 'queued';
          if (message.status === 'ringing') status = 'ringing';
          else if (message.status === 'in-progress') status = 'in-progress';
          else if (message.status === 'ended') status = 'completed';

          await supabase
            .from('calls')
            .update({ status })
            .eq('id', call.id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
