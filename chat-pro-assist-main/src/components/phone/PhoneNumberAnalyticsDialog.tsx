import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PhoneNumberAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: any;
}

export const PhoneNumberAnalyticsDialog = ({
  open,
  onOpenChange,
  phoneNumber,
}: PhoneNumberAnalyticsDialogProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && phoneNumber) {
      fetchAnalytics();
    }
  }, [open, phoneNumber]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('vapi-actions', {
        body: {
          action: 'get-phone-number-analytics',
          data: { phoneNumberId: phoneNumber.number },
        },
      });

      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Analytics - {phoneNumber?.number}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <p className="text-2xl font-bold">{analytics?.totalCalls || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{analytics?.completedCalls || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-2xl font-bold">
                      {Math.floor((analytics?.avgDuration || 0) / 60)}:{((analytics?.avgDuration || 0) % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Recent Calls</h3>
              <div className="space-y-2">
                {analytics?.recentCalls?.length > 0 ? (
                  analytics.recentCalls.map((call: any) => (
                    <Card key={call.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{call.caller_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(call.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{call.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : '-'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No calls yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
