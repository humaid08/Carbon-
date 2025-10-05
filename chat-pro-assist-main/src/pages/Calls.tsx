import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing,
  Search,
  Download,
  Play,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AudioPlayer } from '@/components/call/AudioPlayer';

const Calls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [calls, setCalls] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCalls();
    fetchMetrics();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        () => {
          fetchCalls();
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCalls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch only inbound calls from database
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('owner_id', user.id)
        .eq('direction', 'inbound')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCalls(data || []);
    } catch (error: any) {
      console.error('Error fetching calls:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: calls, error } = await supabase
        .from('calls')
        .select('*')
        .eq('owner_id', user.id)
        .eq('direction', 'inbound');

      if (error) throw error;

      const totalCalls = calls?.length || 0;
      const completedCalls = calls?.filter(c => c.status === 'completed').length || 0;
      const avgDuration = calls?.reduce((acc, c) => acc + (c.duration || 0), 0) / totalCalls || 0;
      const totalCost = calls?.reduce((acc, c) => acc + parseFloat(String(c.cost || 0)), 0) || 0;

      setMetrics({
        totalCalls,
        avgDuration: Math.round(avgDuration),
        totalCost: totalCost.toFixed(2),
        successRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0,
      });
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: 'Completed', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      queued: { label: 'Queued', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      ringing: { label: 'Ringing', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      failed: { label: 'Failed', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      missed: { label: 'Missed', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    };
    return config[status as keyof typeof config] || config.queued;
  };

  const getSentimentBadge = (sentiment: string) => {
    const config = {
      positive: { label: 'Positive', className: 'bg-green-500/10 text-green-500' },
      neutral: { label: 'Neutral', className: 'bg-gray-500/10 text-gray-500' },
      negative: { label: 'Negative', className: 'bg-red-500/10 text-red-500' },
    };
    return config[sentiment as keyof typeof config] || config.neutral;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.caller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.transcript?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const metricsCards = metrics ? [
    {
      title: 'Total Calls',
      value: metrics.totalCalls,
      change: '+12%',
      icon: Phone,
      color: 'text-blue-500'
    },
    {
      title: 'Avg Duration',
      value: formatDuration(metrics.avgDuration),
      change: '+5%',
      icon: Clock,
      color: 'text-purple-500'
    },
    {
      title: 'Total Cost',
      value: `$${metrics.totalCost}`,
      change: '+8%',
      icon: DollarSign,
      color: 'text-orange-500'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate}%`,
      change: '+3%',
      icon: Target,
      color: 'text-green-500'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <h1 className="text-2xl font-bold">Call Logs</h1>
                <p className="text-sm text-muted-foreground">View and manage inbound call logs for your account</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsCards.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass hover-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs text-green-600">
                      {metric.change}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">{metric.title}</h3>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 glass mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by phone, name, or transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('in-progress')}
              >
                Active
              </Button>
            </div>
          </div>
        </Card>

        {/* Calls Table */}
        <Card className="glass">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Calls {filteredCalls.length > 0 && `(${filteredCalls.length})`}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Inbound
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading calls...</p>
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No inbound calls found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-border/50 bg-muted/20">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Call ID</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Assistant</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Phone</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ended Reason</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Evaluation</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call, index) => (
                    <motion.tr
                      key={call.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCall(call);
                        setDetailsOpen(true);
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          {call.vapi_call_id?.substring(0, 8) || call.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">{call.caller_name || 'Unknown Assistant'}</p>
                          <p className="text-xs text-muted-foreground">{call.assistant_id?.substring(0, 8) || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{call.phone_number || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PhoneIncoming className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Inbound</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={
                          call.status === 'completed' 
                            ? 'border-orange-500/50 text-orange-600' 
                            : 'border-red-500/50 text-red-600'
                        }>
                          {call.status === 'completed' ? 'Customer Ended Call' : call.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {call.status === 'completed' ? (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                            Fail
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {call.created_at 
                            ? new Date(call.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Call Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Complete information about this call
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-6">
              {/* Call Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Caller</Label>
                  <p className="font-medium">{selectedCall.caller_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedCall.phone_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadge(selectedCall.status).className}>
                    {getStatusBadge(selectedCall.status).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <p className="font-medium">
                    {selectedCall.duration ? formatDuration(selectedCall.duration) : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cost</Label>
                  <p className="font-medium">${selectedCall.cost || '0.00'}</p>
                </div>
              </div>

              {/* Recording */}
              {selectedCall.recording_url && (
                <div>
                  <Label className="text-sm mb-2 block">Recording</Label>
                  <AudioPlayer 
                    url={selectedCall.recording_url}
                    onDownload={() => window.open(selectedCall.recording_url, '_blank')}
                  />
                </div>
              )}

              {/* AI Summary */}
              {selectedCall.ai_summary && (
                <div>
                  <Label className="text-sm mb-2 block">AI Summary</Label>
                  <Card className="p-4 glass">
                    <p className="text-sm whitespace-pre-wrap">{selectedCall.ai_summary}</p>
                  </Card>
                </div>
              )}

              {/* Transcript */}
              {selectedCall.transcript && (
                <div>
                  <Label className="text-sm mb-2 block">Transcript</Label>
                  <Card className="p-4 glass max-h-60 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedCall.transcript}</p>
                  </Card>
                </div>
              )}

              {/* Sentiment */}
              {selectedCall.sentiment && (
                <div>
                  <Label className="text-sm mb-2 block">Sentiment</Label>
                  <Badge className={getSentimentBadge(selectedCall.sentiment).className}>
                    {getSentimentBadge(selectedCall.sentiment).label}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);

export default Calls;
