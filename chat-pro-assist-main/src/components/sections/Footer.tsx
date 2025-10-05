import { motion } from 'framer-motion';
import { Zap, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'API Documentation', href: '#api' }
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
    { name: 'Blog', href: '#blog' }
  ],
  support: [
    { name: 'Help Center', href: '#help' },
    { name: 'Community', href: '#community' },
    { name: 'Status Page', href: '#status' },
    { name: 'Security', href: '#security' }
  ]
};

export const Footer = () => {
  return (
    <footer className="relative pt-20 pb-10 border-t border-border/50">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center glow-primary">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Assistant</h3>
                <Badge variant="secondary" className="text-xs">24/7 Automated</Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              Transform your business with AI-powered call handling and lead qualification. 
              Never miss an opportunity again.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                hello@aiassistant.com
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-secondary rounded-2xl p-8 mb-12 glass text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get the latest updates on new features, industry insights, and AI automation tips delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <Button className="bg-gradient-primary hover:opacity-90 px-6 glow-primary">
              Subscribe
            </Button>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 AI Assistant. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
    </footer>
  );
};