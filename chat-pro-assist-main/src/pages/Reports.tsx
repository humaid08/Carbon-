import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFrequency, setSelectedFrequency] = useState('weekly');

  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Get reports every day' },
    { value: 'weekly', label: 'Weekly', description: 'Get reports every Monday' },
    { value: 'monthly', label: 'Monthly', description: 'Get reports on the 1st' },
  ];

  const handleSchedule = () => {
    toast({
      title: "Report Scheduled",
      description: `You will receive ${selectedFrequency} reports via email.`,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Downloading Report",
      description: "Your report will be downloaded shortly.",
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
              <h1 className="text-xl font-bold">Reports</h1>
              <p className="text-sm text-muted-foreground">Schedule and download performance reports</p>
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
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Schedule Reports</h3>
            <div className="space-y-4">
              {frequencies.map((freq) => (
                <div
                  key={freq.value}
                  onClick={() => setSelectedFrequency(freq.value)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedFrequency === freq.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{freq.label}</p>
                      <p className="text-sm text-muted-foreground">{freq.description}</p>
                    </div>
                    {selectedFrequency === freq.value && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={handleSchedule} className="w-full bg-gradient-primary">
                <Mail className="w-4 h-4 mr-2" />
                Schedule Email Reports
              </Button>
            </div>
          </Card>

          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Current Period Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Qualified Leads</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">34.2%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">$12,450</p>
              </div>
            </div>
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Full Report
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
