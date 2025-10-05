import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const scaleSpring = useSpring(scale, springConfig);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Subtle gradient orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div 
        style={{ y, opacity, scale: scaleSpring }}
        className="container mx-auto px-6 text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="px-4 py-2">
              AI-Powered Call Assistant
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Never Miss a Call.
            <br />
            Never Lose a Lead.
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            AI assistant that answers every call, books appointments, 
            and delivers qualified leads 24/7.
          </motion.p>

          {/* CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="px-8"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1,000+ businesses</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
              <span className="ml-2">4.9/5</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
