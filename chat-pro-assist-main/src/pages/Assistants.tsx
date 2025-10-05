import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bot, 
  Plus, 
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Calendar,
  HeadphonesIcon,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const ASSISTANT_TEMPLATES = [
  {
    id: 'sales',
    name: 'Sales Assistant',
    description: 'Qualify leads and gather information',
    icon: Sparkles,
    prompt: 'You are a professional sales assistant. Your goal is to qualify leads by understanding their needs, budget, and timeline. Be friendly, professional, and ask relevant questions to gather information. Always end calls with clear next steps.',
    preset_type: 'sales',
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Help customers with issues',
    icon: HeadphonesIcon,
    prompt: 'You are a helpful customer support representative. Listen carefully to customer issues, ask clarifying questions, and provide solutions. Be empathetic, patient, and professional. Always confirm the customer is satisfied before ending the call.',
    preset_type: 'support',
  },
  {
    id: 'appointment',
    name: 'Appointment Scheduler',
    description: 'Schedule meetings and appointments',
    icon: Calendar,
    prompt: 'You are an appointment scheduling assistant. Your role is to find suitable meeting times, confirm availability, and schedule appointments. Be efficient, clear about time zones, and always confirm details before finalizing.',
    preset_type: 'appointment',
  },
  {
    id: 'survey',
    name: 'Survey Collector',
    description: 'Collect feedback and responses',
    icon: BarChart3,
    prompt: 'You are a survey assistant. Guide respondents through questions, ensure you understand their responses, and thank them for their time. Be neutral, clear, and encourage honest feedback.',
    preset_type: 'survey',
  },
  {
    id: 'general',
    name: 'General Business',
    description: 'Versatile assistant for various tasks',
    icon: MessageSquare,
    prompt: 'You are a versatile business assistant. Handle various tasks professionally, adapt to different situations, and provide helpful information. Be friendly, efficient, and always maintain a professional tone.',
    preset_type: 'custom',
  },
];

const Assistants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    description: string;
    prompt: string;
    model: string;
    temperature: number;
    voice_provider: string;
    voice_id: string;
    first_message: string;
    preset_type: 'sales' | 'support' | 'appointment' | 'survey' | 'custom';
  }>({
    id: '',
    name: '',
    description: '',
    prompt: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    voice_provider: 'playht',
    voice_id: 'jennifer',
    first_message: 'Hello! How can I help you today?',
    preset_type: 'custom',
  });

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssistants(data || []);
    } catch (error: any) {
      console.error('Error fetching assistants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assistants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: typeof ASSISTANT_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      prompt: template.prompt,
      preset_type: template.preset_type as 'sales' | 'support' | 'appointment' | 'survey' | 'custom',
    });
  };

  const handleEdit = (assistant: any) => {
    setFormData({
      id: assistant.id,
      name: assistant.name,
      description: assistant.description || '',
      prompt: assistant.prompt,
      model: assistant.model,
      temperature: assistant.temperature || 0.7,
      voice_provider: assistant.voice_provider || 'playht',
      voice_id: assistant.voice_id || 'jennifer',
      first_message: assistant.first_message || 'Hello! How can I help you today?',
      preset_type: assistant.preset_type || 'custom',
    });
    setDialogOpen(true);
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.prompt) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      if (formData.id) {
        // Update existing assistant
        const { error } = await supabase
          .from('assistants')
          .update({
            name: formData.name,
            description: formData.description,
            prompt: formData.prompt,
            model: formData.model,
            temperature: formData.temperature,
            voice_provider: formData.voice_provider,
            voice_id: formData.voice_id,
            first_message: formData.first_message,
            preset_type: formData.preset_type,
          })
          .eq('id', formData.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Assistant updated successfully',
        });
      } else {
        // Create new assistant
        const { data, error } = await supabase.functions.invoke('vapi-actions', {
          body: { action: 'create-assistant', data: formData }
        });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Assistant created successfully',
        });
      }

      setDialogOpen(false);
      setFormData({
        id: '',
        name: '',
        description: '',
        prompt: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        voice_provider: 'playht',
        voice_id: 'jennifer',
        first_message: 'Hello! How can I help you today?',
        preset_type: 'custom',
      });
      fetchAssistants();
    } catch (error: any) {
      console.error('Error saving assistant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save assistant',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assistant?')) return;

    try {
      const { error } = await supabase
        .from('assistants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assistant deleted successfully',
      });
      fetchAssistants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete assistant',
        variant: 'destructive',
      });
    }
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
                <h1 className="text-2xl font-bold">AI Assistants</h1>
                <p className="text-sm text-muted-foreground">Manage your AI voice assistants</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setFormData({
                  id: '',
                  name: '',
                  description: '',
                  prompt: '',
                  model: 'gpt-3.5-turbo',
                  temperature: 0.7,
                  voice_provider: 'playht',
                  voice_id: 'jennifer',
                  first_message: 'Hello! How can I help you today?',
                  preset_type: 'custom',
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assistant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{formData.id ? 'Edit' : 'Create'} AI Assistant</DialogTitle>
                  <DialogDescription>
                    Choose a template or create a custom assistant
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Templates */}
                  <div>
                    <Label className="mb-3 block">Templates</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {ASSISTANT_TEMPLATES.map((template) => (
                        <Card
                          key={template.id}
                          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => loadTemplate(template)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <template.icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="My Assistant"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What does this assistant do?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prompt">System Prompt *</Label>
                      <Textarea
                        id="prompt"
                        value={formData.prompt}
                        onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                        placeholder="You are a helpful assistant..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="model">AI Model</Label>
                        <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="voice">Voice</Label>
                        <Select value={formData.voice_id} onValueChange={(value) => setFormData({ ...formData, voice_id: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jennifer">Jennifer</SelectItem>
                            <SelectItem value="mark">Mark</SelectItem>
                            <SelectItem value="sarah">Sarah</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Temperature: {formData.temperature}</Label>
                      <Slider
                        value={[formData.temperature]}
                        onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                        min={0}
                        max={1}
                        step={0.1}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower = more focused, Higher = more creative
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="first_message">First Message</Label>
                      <Input
                        id="first_message"
                        value={formData.first_message}
                        onChange={(e) => setFormData({ ...formData, first_message: e.target.value })}
                        placeholder="Hello! How can I help you today?"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOrUpdate} disabled={creating}>
                      {creating ? (formData.id ? 'Updating...' : 'Creating...') : (formData.id ? 'Update Assistant' : 'Create Assistant')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading assistants...</p>
          </div>
        ) : assistants.length === 0 ? (
          <Card className="p-12 text-center">
            <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Assistants Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first AI assistant to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assistant
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistants.map((assistant) => (
              <motion.div
                key={assistant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 glass hover-glow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={assistant.is_active ? 'default' : 'secondary'}>
                        {assistant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{assistant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {assistant.description || 'No description'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{assistant.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {assistant.preset_type}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(assistant)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(assistant.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assistants;
