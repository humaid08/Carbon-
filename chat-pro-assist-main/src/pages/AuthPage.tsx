import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Zap, Mail, Github, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (!error) {
        navigate('/dashboard');
      }
    } else {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company
      });
      
      if (!error) {
        // Don't navigate immediately for signup - user needs to verify email
        // The toast will inform them about email verification
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 glass hover-glow"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <div className="w-full max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <motion.div 
              className="flex justify-center items-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src="/src/assets/carbon-logo.png" 
                alt="Carbon" 
                className="w-12 h-12 rounded-xl glow-primary"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Carbon</h1>
                <Badge variant="secondary" className="text-xs">24/7 Automated</Badge>
              </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-muted-foreground">
                  {isLogin 
                    ? 'Sign in to your dashboard and manage your AI assistant'
                    : 'Join thousands of businesses using AI to capture more leads'
                  }
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Auth Form */}
          <Card className="p-8 glass glow-primary">
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login-form' : 'signup-form'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Sign Up Fields */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                      placeholder="Your company name"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-2"
                    placeholder="name@company.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password for Sign Up */}
                {!isLogin && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {/* Forgot Password */}
                {isLogin && (
                  <div className="text-right">
                    <Button variant="link" className="p-0 text-sm text-muted-foreground hover:text-primary">
                      Forgot password?
                    </Button>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 glow-primary hover-lift py-3"
                  size="lg"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <Separator className="my-6" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-card px-2 text-sm text-muted-foreground">or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="glass hover:bg-muted/50"
                    type="button"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="glass hover:bg-muted/50"
                    type="button"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </motion.form>
            </AnimatePresence>

            {/* Switch Auth Mode */}
            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <Button
                  variant="link"
                  className="p-0 text-sm font-medium text-primary hover:text-primary-glow"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign up for free' : 'Sign in'}
                </Button>
              </p>
            </div>
          </Card>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center mt-8 space-y-4"
          >
            <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>GDPR Ready</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              By {isLogin ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy. 
              Your data is encrypted and secure.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;