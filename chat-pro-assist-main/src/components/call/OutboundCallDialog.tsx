import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';

interface OutboundCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistants: any[];
  phoneNumber?: string;
}

export const OutboundCallDialog = ({ 
  open, 
  onOpenChange, 
  assistants,
  phoneNumber = ''
}: OutboundCallDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: phoneNumber,
    assistantId: '',
    customMessage: '',
  });

  const handleMakeCall = async () => {
    if (!formData.phoneNumber || !formData.assistantId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapi-actions', {
        body: {
          action: 'make-call',
          data: {
            phoneNumber: formData.phoneNumber,
            assistantId: formData.assistantId,
            customMessage: formData.customMessage,
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Outbound call initiated successfully',
      });

      onOpenChange(false);
      setFormData({ phoneNumber: '', assistantId: '', customMessage: '' });
    } catch (error: any) {
      console.error('Error making call:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate call',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Outbound Call</DialogTitle>
          <DialogDescription>
            Initiate an AI-powered outbound call
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="assistant">Select Assistant *</Label>
            <Select 
              value={formData.assistantId} 
              onValueChange={(value) => setFormData({ ...formData, assistantId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an assistant" />
              </SelectTrigger>
              <SelectContent>
                {assistants.filter(a => a.is_active).map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.vapi_assistant_id || assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Custom First Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Override the assistant's default first message..."
              value={formData.customMessage}
              onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleMakeCall} disabled={loading} className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              {loading ? 'Calling...' : 'Make Call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};