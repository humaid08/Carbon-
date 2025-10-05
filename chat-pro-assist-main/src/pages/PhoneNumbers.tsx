import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  ArrowLeft,
  Plus,
  Settings,
  PhoneCall,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreatePhoneNumberDialog } from '@/components/phone/CreatePhoneNumberDialog';
import { PhoneNumberSettingsDialog } from '@/components/phone/PhoneNumberSettingsDialog';
import { PhoneNumberAnalyticsDialog } from '@/components/phone/PhoneNumberAnalyticsDialog';

const PhoneNumbers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch phone numbers from Vapi
      const { data: numbersData, error: numbersError } = await supabase.functions.invoke('vapi-actions', {
        body: { action: 'get-phone-numbers' }
      });

      if (numbersError) throw numbersError;

      // Fetch assistants
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('assistants')
        .select('*')
        .eq('is_active', true);

      if (assistantsError) throw assistantsError;

      setPhoneNumbers(numbersData?.phoneNumbers || []);
      setAssistants(assistantsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load phone numbers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = (phoneNumber: any) => {
    setSelectedPhoneNumber(phoneNumber);
    setSettingsDialogOpen(true);
  };

  const handleOpenAnalytics = (phoneNumber: any) => {
    setSelectedPhoneNumber(phoneNumber);
    setAnalyticsDialogOpen(true);
  };

  const handleCreateClick = () => {
    if (phoneNumbers.length >= 5) {
      toast({
        title: 'Limit Reached',
        description: 'You can only create up to 5 phone numbers. Please delete an existing number first.',
        variant: 'destructive',
      });
      return;
    }
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = (newPhoneNumber: any) => {
    fetchData();
    // Auto-open settings dialog for the newly created number
    setSelectedPhoneNumber(newPhoneNumber);
    setSettingsDialogOpen(true);
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
                <h1 className="text-2xl font-bold">Phone Numbers</h1>
                <p className="text-sm text-muted-foreground">Manage your Vapi phone numbers</p>
              </div>
            </div>
            <Button onClick={handleCreateClick} disabled={phoneNumbers.length >= 5}>
              <Plus className="w-4 h-4 mr-2" />
              Create Phone Number {phoneNumbers.length >= 5 && '(Limit Reached)'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading phone numbers...</p>
          </div>
        ) : phoneNumbers.length === 0 ? (
          <Card className="p-12 text-center">
            <Phone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Phone Numbers Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first phone number to start receiving incoming calls</p>
            <Button className="mt-6" onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create Phone Number
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phoneNumbers.map((number, index) => (
              <motion.div
                key={number.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass hover-glow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary">
                      {number.provider || 'Vapi'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{number.number}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Calls:</span>
                      <span className="font-medium flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" />
                        {number.callCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Assistant:</span>
                      <Badge variant="outline" className="text-xs">
                        {assistants.find(a => a.vapi_assistant_id === number.assistantId)?.name || 'None'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOpenSettings(number)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOpenAnalytics(number)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreatePhoneNumberDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        assistants={assistants}
        onSuccess={handleCreateSuccess}
      />

      <PhoneNumberSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        phoneNumber={selectedPhoneNumber}
        assistants={assistants}
        onSuccess={fetchData}
      />

      <PhoneNumberAnalyticsDialog
        open={analyticsDialogOpen}
        onOpenChange={setAnalyticsDialogOpen}
        phoneNumber={selectedPhoneNumber}
      />
    </div>
  );
};

export default PhoneNumbers;