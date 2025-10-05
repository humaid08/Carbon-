import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    company: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          company: data.company || '',
          avatar_url: data.avatar_url || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          company: profile.company,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
              <h1 className="text-xl font-bold">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to an image for your profile picture
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed from this page
                  </p>
                </div>
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              className="bg-gradient-primary"
              disabled={saving || loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
