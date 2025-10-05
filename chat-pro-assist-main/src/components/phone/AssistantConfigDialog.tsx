import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AssistantConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant: any;
  onSuccess: () => void;
}

export const AssistantConfigDialog = ({
  open,
  onOpenChange,
  assistant,
  onSuccess,
}: AssistantConfigDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    firstMessage: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    voiceProvider: 'eleven-labs',
    voiceId: '',
  });

  useEffect(() => {
    if (assistant) {
      setFormData({
        name: assistant.name || '',
        prompt: assistant.prompt || '',
        firstMessage: assistant.first_message || '',
        model: assistant.model || 'gpt-3.5-turbo',
        temperature: assistant.temperature || 0.7,
        voiceProvider: assistant.voice_provider || 'eleven-labs',
        voiceId: assistant.voice_id || '',
      });
    }
  }, [assistant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('assistants')
        .update({
          name: formData.name,
          prompt: formData.prompt,
          first_message: formData.firstMessage,
          model: formData.model,
          temperature: formData.temperature,
          voice_provider: formData.voiceProvider,
          voice_id: formData.voiceId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assistant.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assistant configuration updated successfully',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update assistant',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Configure AI Assistant
          </DialogTitle>
          <DialogDescription>
            Customize your AI assistant's behavior, voice, and objectives
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="model">Model & Voice</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Assistant Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Assistant"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Configuration / Identity</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Define who the AI assistant is, their personality, and how they should behave..."
                  className="min-h-[150px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This defines the AI's identity and personality. Be specific about who they are and how they should respond.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstMessage">First Message</Label>
                <Textarea
                  id="firstMessage"
                  value={formData.firstMessage}
                  onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  The first thing the AI will say when answering a call.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="model" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Faster)</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the AI model that powers the assistant. More powerful models cost more per call.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceProvider">Voice Provider</Label>
                <Select value={formData.voiceProvider} onValueChange={(value) => setFormData({ ...formData, voiceProvider: value })}>
                  <SelectTrigger id="voiceProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eleven-labs">ElevenLabs</SelectItem>
                    <SelectItem value="playht">PlayHT</SelectItem>
                    <SelectItem value="deepgram">Deepgram</SelectItem>
                    <SelectItem value="openai">OpenAI TTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceId">Voice ID</Label>
                <Input
                  id="voiceId"
                  value={formData.voiceId}
                  onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                  placeholder="Enter voice ID from provider"
                />
                <p className="text-xs text-muted-foreground">
                  Get voice IDs from your voice provider's dashboard (e.g., ElevenLabs voice library).
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature: {formData.temperature}</Label>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[formData.temperature]}
                    onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness. Lower values (0-0.5) make responses more focused and deterministic. Higher values (1-2) make responses more creative.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="text-sm font-semibold">Model Settings</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Temperature: {formData.temperature}</p>
                    <p>• Model: {formData.model}</p>
                    <p>• Voice: {formData.voiceProvider}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};