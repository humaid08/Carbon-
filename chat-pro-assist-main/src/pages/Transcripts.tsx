import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Conversation {
  id: string;
  channel: string;
  message: string;
  direction: string;
  created_at: string;
  lead_id: string;
  leads: {
    name: string;
    company: string;
  };
}

const Transcripts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        // Fetch conversations with type assertion
        const { data: conversations, error: convError } = await (supabase as any)
          .from('conversations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!convError && conversations) {
          // Fetch leads separately with type assertion
          const { data: leads, error: leadsError } = await (supabase as any)
            .from('leads')
            .select('*');

          if (!leadsError && leads) {
            const conversationsWithLeads = conversations.map((conv: any) => {
              const lead = leads.find((l: any) => l.id === conv.lead_id);
              return {
                ...conv,
                leads: lead ? {
                  name: lead.name,
                  company: lead.company
                } : null
              };
            });
            setConversations(conversationsWithLeads as any);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
      
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  const getDirectionBadge = (direction: string) => {
    return direction === 'inbound' 
      ? { label: 'Inbound', color: 'bg-blue-500/10 text-blue-500' }
      : { label: 'Outbound', color: 'bg-purple-500/10 text-purple-500' };
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
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
              <h1 className="text-xl font-bold">Call Transcripts</h1>
              <p className="text-sm text-muted-foreground">View all AI conversation logs</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass">
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading transcripts...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transcripts available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{conv.leads?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{conv.leads?.company || 'No company'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDirectionBadge(conv.direction).color}>
                            {getDirectionBadge(conv.direction).label}
                          </Badge>
                          <Badge variant="outline">
                            {conv.channel || 'Phone'}
                          </Badge>
                        </div>
                      </div>
                      <div className="pl-11">
                        <p className="text-sm mb-2">{conv.message}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(conv.created_at).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Transcripts;
