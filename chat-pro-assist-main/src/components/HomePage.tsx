import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Phone, Zap, Target, Users, Star, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroSection } from './sections/HeroSection';
import { ValueProposition } from './sections/ValueProposition';
import { Testimonials } from './sections/Testimonials';
import { HowItWorks } from './sections/HowItWorks';
import { PricingSection } from './sections/PricingSection';
import { FloatingCTA } from './ui/FloatingCTA';
import { AIChatBot } from './ui/AIChatBot';
import { Navigation } from './ui/Navigation';
import { Footer } from './sections/Footer';

const HomePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 -z-10"
        style={{ y: backgroundY, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </motion.div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <HeroSection />
        <ValueProposition />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <Footer />
      </main>

      {/* Floating Elements */}
      <FloatingCTA />
      <AIChatBot />
    </div>
  );
};

export default HomePage;