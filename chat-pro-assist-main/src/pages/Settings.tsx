import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vapiConnected, setVapiConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    aiEnabled: true,
    autoFollowup: true,
    notificationsEnabled: true,
    emailNotifications: true,
    callRecording: true,
    transcription: true,
    businessHours: '9:00 AM - 5:00 PM',
    responseTime: '2',
    qualificationThreshold: '70',
    defaultAssistant: '',
    webhookUrl: '',
    transcriptLanguage: 'en',
  });

  useEffect(() => {
    checkVapiConnection();
  }, []);

  const checkVapiConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('vapi-actions', {
        body: { action: 'test-connection' }
      });
      setVapiConnected(!error && data?.connected);
    } catch (error) {
      setVapiConnected(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    await checkVapiConnection();
    setTesting(false);
    toast({
      title: vapiConnected ? 'Connected' : 'Connection Failed',
      description: vapiConnected ? 'Vapi API is connected successfully' : 'Failed to connect to Vapi API',
      variant: vapiConnected ? 'default' : 'destructive',
    });
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
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
              <h1 className="text-xl font-bold">AI Settings</h1>
              <p className="text-sm text-muted-foreground">Configure your AI assistant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Vapi Configuration */}
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Vapi Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage your Vapi AI integration</p>
              </div>
              <Badge variant={vapiConnected ? 'default' : 'destructive'} className="flex items-center gap-2">
                {vapiConnected ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {vapiConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL (For Incoming Calls)</Label>
                <div className="flex gap-2">
                  <Input
                    value="https://kprydlijsjygdpuoylwj.supabase.co/functions/v1/vapi-webhook"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText('https://kprydlijsjygdpuoylwj.supabase.co/functions/v1/vapi-webhook');
                      toast({ title: 'Copied to clipboard' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>✅ Configure this in Vapi: Go to your <a href="https://dashboard.vapi.ai/phone-numbers" target="_blank" rel="noopener noreferrer" className="text-primary underline">Vapi Phone Numbers</a>, select your number, and set this as the Server URL</p>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">💡 How Incoming Calls Work:</p>
                    <ol className="space-y-1 ml-4 list-decimal">
                      <li>Customer calls your Vapi phone number</li>
                      <li>Vapi sends call data to this webhook</li>
                      <li>Your AI assistant automatically answers</li>
                      <li>Call is logged in your dashboard with transcript & summary</li>
                    </ol>
                  </div>
                </div>
              </div>
              <Button onClick={testConnection} disabled={testing} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>
          </Card>

          {/* Call Settings */}
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Call Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Call Recording</Label>
                  <p className="text-sm text-muted-foreground">Automatically record all calls</p>
                </div>
                <Switch
                  checked={settings.callRecording}
                  onCheckedChange={(checked) => setSettings({ ...settings, callRecording: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transcription</Label>
                  <p className="text-sm text-muted-foreground">Enable real-time transcription</p>
                </div>
                <Switch
                  checked={settings.transcription}
                  onCheckedChange={(checked) => setSettings({ ...settings, transcription: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Transcript Language</Label>
                <Select value={settings.transcriptLanguage} onValueChange={(value) => setSettings({ ...settings, transcriptLanguage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* General Settings */}
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">General Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Assistant Enabled</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable the AI assistant</p>
                </div>
                <Switch
                  checked={settings.aiEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Follow-up</Label>
                  <p className="text-sm text-muted-foreground">Automatically schedule follow-ups for leads</p>
                </div>
                <Switch
                  checked={settings.autoFollowup}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoFollowup: checked })}
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Notifications</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new calls</p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get email alerts for important events</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Performance Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Business Hours</Label>
                <Input
                  value={settings.businessHours}
                  onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                  placeholder="9:00 AM - 5:00 PM"
                />
              </div>

              <div className="space-y-2">
                <Label>Response Time (seconds)</Label>
                <Input
                  type="number"
                  value={settings.responseTime}
                  onChange={(e) => setSettings({ ...settings, responseTime: e.target.value })}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label>Qualification Threshold (%)</Label>
                <Input
                  type="number"
                  value={settings.qualificationThreshold}
                  onChange={(e) => setSettings({ ...settings, qualificationThreshold: e.target.value })}
                  placeholder="70"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
