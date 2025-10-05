import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Database, Calendar, Clock, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallRecord {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  date?: string;
  time?: string;
  service?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  callId: string;
  createdAt: string;
}

const Records = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('calls-records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch calls with AI summaries
      const { data: calls, error } = await supabase
        .from('calls')
        .select('*')
        .eq('owner_id', user.id)
        .not('ai_summary', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse AI summaries to extract call record data
      const parsedRecords: CallRecord[] = (calls || []).map(call => {
        return {
          id: call.id,
          customerName: call.caller_name || 'Unknown',
          phone: call.phone_number || '',
          email: extractEmail(call.ai_summary),
          date: extractDate(call.ai_summary) || new Date(call.created_at).toISOString().split('T')[0],
          time: extractTime(call.ai_summary) || new Date(call.created_at).toLocaleTimeString(),
          service: extractService(call.ai_summary) || 'General Inquiry',
          notes: call.ai_summary,
          status: extractStatus(call.ai_summary),
          callId: call.vapi_call_id || call.id,
          createdAt: call.created_at
        };
      });

      setRecords(parsedRecords);
    } catch (error: any) {
      console.error('Error fetching records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract data from AI summaries
  const extractEmail = (text: string): string | undefined => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text?.match(emailRegex);
    return match ? match[0] : undefined;
  };

  const extractDate = (text: string): string | null => {
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/;
    const match = text?.match(dateRegex);
    return match ? match[0] : null;
  };

  const extractTime = (text: string): string | null => {
    const timeRegex = /\b\d{1,2}:\d{2}\s?(AM|PM|am|pm)\b/;
    const match = text?.match(timeRegex);
    return match ? match[0] : null;
  };

  const extractService = (text: string): string => {
    const services = ['consultation', 'meeting', 'demo', 'call', 'appointment', 'inquiry', 'support'];
    for (const service of services) {
      if (text?.toLowerCase().includes(service)) {
        return service.charAt(0).toUpperCase() + service.slice(1);
      }
    }
    return 'Service';
  };

  const extractStatus = (text: string): 'pending' | 'confirmed' | 'cancelled' => {
    const lower = text?.toLowerCase() || '';
    if (lower.includes('confirmed') || lower.includes('confirm')) return 'confirmed';
    if (lower.includes('cancelled') || lower.includes('cancel')) return 'cancelled';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Call Records
                </h1>
                <p className="text-sm text-muted-foreground">All customer interactions and data captured from calls</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <Card className="p-12 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Records Yet</h3>
            <p className="text-muted-foreground">Customer data and interactions from calls will appear here</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 glass hover-glow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={record.status === 'confirmed' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">{record.customerName}</h3>

                  <div className="space-y-3">
                    {record.date && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{record.date}</span>
                      </div>
                    )}
                    {record.time && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{record.time}</span>
                      </div>
                    )}
                    {record.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{record.phone}</span>
                      </div>
                    )}
                    {record.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{record.email}</span>
                      </div>
                    )}
                    {record.service && (
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{record.service}</span>
                      </div>
                    )}
                    {record.notes && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Records;