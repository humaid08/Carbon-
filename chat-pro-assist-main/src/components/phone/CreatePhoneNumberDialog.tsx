import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreatePhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistants: any[];
  onSuccess: (phoneNumber: any) => void;
}

export const CreatePhoneNumberDialog = ({
  open,
  onOpenChange,
  assistants,
  onSuccess,
}: CreatePhoneNumberDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [areaCode, setAreaCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!areaCode || areaCode.length !== 3) {
      toast({
        title: 'Invalid Area Code',
        description: 'Please enter a valid 3-digit area code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('create-phone-number', {
        body: { areaCode },
      });

      if (error) throw error;

      toast({
        title: 'Phone Number Created',
        description: 'Your phone number has been created successfully. Configure it now.',
      });

      onSuccess(data);
      onOpenChange(false);
      setAreaCode('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create phone number',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phone Number Options</DialogTitle>
          <DialogDescription>
            Create a free Vapi phone number
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="areaCode">Area Code</Label>
            <Input
              id="areaCode"
              placeholder="e.g. 346, 984, 326"
              value={areaCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                setAreaCode(value);
              }}
              maxLength={3}
              className="text-lg"
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Free US phone numbers</strong> • Up to 10 per account
              <br />
              <span className="text-xs text-muted-foreground">
                Only US area codes are supported. For international numbers, use the import options above.
              </span>
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || areaCode.length !== 3}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
