import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  Settings, 
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Zap,
  Download,
  Bot,
  PhoneIncoming,
  PhoneOutgoing,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LiveCallFeed } from '@/components/dashboard/LiveCallFeed';
import { CallAnalytics } from '@/components/dashboard/CallAnalytics';
import { OutboundCallDialog } from '@/components/call/OutboundCallDialog';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [stats, setStats] = useState({
    totalCalls: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    revenue: 0,
  });
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [outboundDialogOpen, setOutboundDialogOpen] = useState(false);
  const [callsOverTime, setCallsOverTime] = useState<any[]>([]);
  const [callOutcomes, setCallOutcomes] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    fetchUserProfile();
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch calls data
        const { data: callsData, error: callsError } = await supabase.functions.invoke('vapi-actions', {
          body: { action: 'get-calls', data: { limit: 10 } }
        });

        // Fetch metrics
        const { data: metricsData, error: metricsError } = await supabase.functions.invoke('vapi-actions', {
          body: { action: 'get-call-metrics', data: {} }
        });

        // Fetch assistants
        const { data: assistantsData } = await supabase
          .from('assistants')
          .select('*')
          .eq('is_active', true);
        
        setAssistants(assistantsData || []);

        if (!callsError && callsData) {
          setRecentCalls(callsData.map((call: any) => ({
            id: call.id,
            caller: call.caller_name || 'Unknown',
            company: call.leads?.company || 'No company',
            time: new Date(call.created_at).toLocaleTimeString(),
            duration: call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : '0:00',
            status: call.status || 'new',
            score: call.sentiment === 'positive' ? 85 : call.sentiment === 'negative' ? 45 : 65,
          })));
        }

        if (!metricsError && metricsData) {
          setStats({
            totalCalls: metricsData.totalCalls || 0,
            qualifiedLeads: Math.round(metricsData.totalCalls * 0.6) || 0,
            conversionRate: parseFloat(metricsData.successRate) || 0,
            revenue: Math.round(metricsData.totalCalls * 150) || 0,
          });

          // Generate real analytics data from calls
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          });

          const callsByDay = last7Days.map(day => {
            const count = (callsData || []).filter((call: any) => {
              const callDate = new Date(call.created_at).toLocaleDateString('en-US', { weekday: 'short' });
              return callDate === day;
            }).length;
            return { date: day, calls: count };
          });

          setCallsOverTime(callsByDay);

          const completedCount = (callsData || []).filter((c: any) => c.status === 'completed').length;
          const failedCount = (callsData || []).filter((c: any) => c.status === 'failed').length;
          const missedCount = metricsData.totalCalls - completedCount - failedCount;

          setCallOutcomes([
            { name: 'Completed', value: completedCount },
            { name: 'Missed', value: missedCount },
            { name: 'Failed', value: failedCount },
          ]);

          const positiveCount = (callsData || []).filter((c: any) => c.sentiment === 'positive').length;
          const neutralCount = (callsData || []).filter((c: any) => c.sentiment === 'neutral').length;
          const negativeCount = (callsData || []).filter((c: any) => c.sentiment === 'negative').length;

          setSentimentData([
            { sentiment: 'Positive', count: positiveCount },
            { sentiment: 'Neutral', count: neutralCount },
            { sentiment: 'Negative', count: negativeCount },
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }

      setLoading(false);
    };

    fetchDashboardData();

    // Real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (profile?.first_name) {
        setUserName(profile.first_name);
      } else {
        setUserName(user.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const statsDisplay = [
    {
      title: 'Total Calls Today',
      value: stats.totalCalls.toString(),
      change: '+23%',
      trend: 'up',
      icon: Phone,
      color: 'text-blue-500'
    },
    {
      title: 'Qualified Leads',
      value: stats.qualifiedLeads.toString(),
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+5.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: 'Revenue Generated',
      value: `$${stats.revenue.toLocaleString()}`,
      change: '+28%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-orange-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      qualified: { label: 'Qualified Lead', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      'follow-up': { label: 'Follow Up', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      rejected: { label: 'Not Qualified', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
    };
    return config[status as keyof typeof config] || config.qualified;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/src/assets/carbon-logo.png" 
                alt="Carbon" 
                className="h-8 w-8 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold">Carbon Dashboard</h1>
                <Badge variant="secondary" className="text-xs">Live Analytics</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/calls')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Calls
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/records')}>
                  <Database className="w-4 h-4 mr-2" />
                  Records
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/phone-numbers')}>
                  <PhoneIncoming className="w-4 h-4 mr-2" />
                  Numbers
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/assistants')}>
                  <Bot className="w-4 h-4 mr-2" />
                  Assistants
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage src="/placeholder-avatar.png" />
                  <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
          <p className="text-muted-foreground">Here's what's happening with your AI assistant today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 glass hover-glow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-accent/10`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs text-green-600">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Call Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <LiveCallFeed />
          </div>
          <Card className="p-6 glass">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start opacity-60 cursor-not-allowed"
                disabled
              >
                <PhoneOutgoing className="w-4 h-4 mr-2" />
                Make Outbound Call
                <Badge variant="secondary" className="ml-auto text-xs">Coming Soon</Badge>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/records')}
              >
                <Database className="w-4 h-4 mr-2" />
                View Records
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/assistants')}
              >
                <Bot className="w-4 h-4 mr-2" />
                Create Assistant
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/phone-numbers')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Manage Numbers
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Call Analytics</h2>
          <CallAnalytics 
            callsOverTime={callsOverTime}
            callOutcomes={callOutcomes}
            sentimentData={sentimentData}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Calls */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Calls</h3>
                  <Button variant="outline" size="sm" className="glass" onClick={() => navigate('/calls')}>
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : recentCalls.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent calls yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCalls.map((call) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: call.id * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {call.caller.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{call.caller}</p>
                          <p className="text-sm text-muted-foreground">{call.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">{call.time}</p>
                          <p className="text-xs text-muted-foreground">{call.duration}</p>
                        </div>
                        <Badge className={getStatusBadge(call.status).color}>
                          {getStatusBadge(call.status).label}
                        </Badge>
                        <div className="text-sm font-medium w-12 text-center">
                          {call.score}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions & Status */}
          <div className="space-y-6">
            {/* AI Status */}
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">AI Assistant Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span>Live & Active</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    Online
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time</span>
                    <span>0.8s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span>98.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Calls Handled</span>
                    <span>{stats.totalCalls} today</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Today's Goals */}
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">Today's Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm">100+ calls handled ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm">80+ qualified leads ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">30% conversion rate</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Outbound Call Dialog */}
      <OutboundCallDialog 
        open={outboundDialogOpen}
        onOpenChange={setOutboundDialogOpen}
        assistants={assistants}
      />
    </div>
  );
};

export default Dashboard;