import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const LiveCallFeed = () => {
  const [activeCalls, setActiveCalls] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveCalls();

    const channel = supabase
      .channel('active-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `status=in:("ringing","in-progress")`
        },
        () => {
          fetchActiveCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveCalls = async () => {
    const { data } = await supabase
      .from('calls')
      .select('*')
      .in('status', ['ringing', 'in-progress'])
      .order('start_time', { ascending: false });

    setActiveCalls(data || []);
  };

  if (activeCalls.length === 0) {
    return (
      <Card className="p-6 glass text-center">
        <Phone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No active calls</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 glass space-y-3">
      <h3 className="font-semibold text-sm mb-3">Active Calls ({activeCalls.length})</h3>
      {activeCalls.map((call) => (
        <div 
          key={call.id} 
          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-sm">{call.caller_name || 'Unknown'}</span>
            </div>
            <p className="text-xs text-muted-foreground">{call.phone_number}</p>
          </div>
          <Badge 
            variant={call.status === 'ringing' ? 'secondary' : 'default'}
            className="text-xs"
          >
            {call.status}
          </Badge>
        </div>
      ))}
    </Card>
  );
};