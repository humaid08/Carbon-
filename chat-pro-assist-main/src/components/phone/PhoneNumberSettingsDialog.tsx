import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash2, AlertCircle, Settings2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AssistantConfigDialog } from './AssistantConfigDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PhoneNumberSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: any;
  assistants: any[];
  onSuccess: () => void;
}

export const PhoneNumberSettingsDialog = ({
  open,
  onOpenChange,
  phoneNumber,
  assistants,
  onSuccess,
}: PhoneNumberSettingsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assistantConfigOpen, setAssistantConfigOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    assistantId: '',
    serverUrl: '',
    credential: '',
    noAuthentication: false,
  });

  useEffect(() => {
    if (phoneNumber) {
      setFormData({
        name: phoneNumber.name || `Number ${phoneNumber.number?.slice(-4) || ''}`,
        assistantId: phoneNumber.assistantId || '',
        serverUrl: phoneNumber.serverUrl || `https://kprydlijsjygdpuoylwj.supabase.co/functions/v1/vapi-webhook`,
        credential: phoneNumber.credential || '',
        noAuthentication: phoneNumber.noAuthentication || false,
      });
    }
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('vapi-actions', {
        body: {
          action: 'update-phone-number',
          data: {
            phoneNumberId: phoneNumber.id,
            ...formData,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Phone number settings updated successfully',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update phone number',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('vapi-actions', {
        body: {
          action: 'delete-phone-number',
          data: {
            phoneNumberId: phoneNumber.id,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Phone number deleted successfully',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete phone number',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Phone Number Details</DialogTitle>
            <DialogDescription>
              {phoneNumber?.number || 'Configure your phone number'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Phone Number Label</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Number 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverUrl">Phone Number Server URL</Label>
                <Input
                  id="serverUrl"
                  value={formData.serverUrl}
                  className="bg-muted font-mono text-sm"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  This URL will receive all inbound calls for your phone number. This URL cannot be regenerated once set.
                </p>
              </div>

              {/* Authentication Credential */}
              <div className="space-y-3">
                <Label>Authentication Credential</Label>
                <p className="text-xs text-muted-foreground">
                  Select or create a credential that the webhook server should use to authenticate its requests.
                </p>
                <Select value={formData.credential} onValueChange={(value) => setFormData({ ...formData, credential: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a credential" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No authentication</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="link" className="h-auto p-0 text-primary text-sm" size="sm">
                  + Add New Credential
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credential">Credential</Label>
                <Input
                  id="credential"
                  value={formData.credential}
                  onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
                  placeholder="Enter credential ID"
                  disabled={formData.noAuthentication}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noAuth"
                  checked={formData.noAuthentication}
                  onCheckedChange={(checked) => setFormData({ ...formData, noAuthentication: checked as boolean })}
                />
                <Label htmlFor="noAuth" className="text-sm font-normal cursor-pointer">
                  No authentication
                </Label>
              </div>

              {/* Transport Records */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Transport Records</Label>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>No custom inbound available</strong>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Create a custom credential to set up your SIP inbound
                    </span>
                  </AlertDescription>
                </Alert>
                <Button type="button" variant="outline" size="sm" disabled>
                  + Create Custom Credential
                </Button>
              </div>
            </div>

            {/* Inbound Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Inbound Settings</h3>
              <p className="text-sm text-muted-foreground">
                Assign an assistant to handle inbound calls on this number automatically.
              </p>

              <div className="space-y-2">
                <Label htmlFor="assistant">Inbound Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={formData.assistantId} onValueChange={(value) => setFormData({ ...formData, assistantId: value })}>
                    <SelectTrigger id="assistant" className="flex-1">
                      <SelectValue placeholder="Select an assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      {assistants.map((assistant) => (
                        <SelectItem key={assistant.id} value={assistant.vapi_assistant_id || assistant.id}>
                          {assistant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.assistantId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const assistant = assistants.find(a => a.vapi_assistant_id === formData.assistantId || a.id === formData.assistantId);
                        if (assistant) {
                          setSelectedAssistant(assistant);
                          setAssistantConfigOpen(true);
                        }
                      }}
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select an assistant and click the settings icon to configure its behavior and objectives
                </p>
              </div>

              <div className="space-y-2">
                <Label>Assistant</Label>
                <Alert className="bg-muted/50 border-muted">
                  <AlertDescription className="text-sm">
                    <strong>Default</strong>
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <Label>Squad</Label>
                <Alert className="bg-yellow-500/10 border-yellow-500/50">
                  <AlertDescription className="text-yellow-600 dark:text-yellow-400 text-sm">
                    <strong>No squads available.</strong> Create a squad to enable this feature.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Fallback Section */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Fallback</Label>
                <p className="text-xs text-muted-foreground">
                  Add fallback phone numbers to try if the assistant doesn't respond. Uses E.164 format.
                </p>
                <Button type="button" variant="outline" size="sm">
                  + Add New
                </Button>
              </div>

              {/* Inbound Destination */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Inbound Destination</Label>
                <p className="text-xs text-muted-foreground">
                  Set phone number(s) where calls will be transferred once available.
                </p>
                <Alert className="bg-muted/50 border-muted">
                  <AlertDescription className="text-xs text-muted-foreground">
                    <strong>Fallback Destination</strong>
                    <br />
                    Enter a phone number in E.164 format
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Number
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {phoneNumber?.number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AssistantConfigDialog
        open={assistantConfigOpen}
        onOpenChange={setAssistantConfigOpen}
        assistant={selectedAssistant}
        onSuccess={onSuccess}
      />
    </>
  );
};
