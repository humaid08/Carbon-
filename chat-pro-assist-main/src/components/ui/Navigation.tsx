import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass backdrop-blur-xl border-b border-border/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/src/assets/carbon-logo.png" 
              alt="Carbon" 
              className="h-10 w-10 rounded-xl glow-primary"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Carbon</h1>
              <Badge variant="secondary" className="text-xs">24/7 Automated</Badge>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="hover-glow"
            >
              Log In
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 glow-primary hover-lift"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-col space-y-2 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="justify-start"
              >
                Log In
              </Button>
              <Button 
                className="bg-gradient-primary hover:opacity-90 justify-start"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};