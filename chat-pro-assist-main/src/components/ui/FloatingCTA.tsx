import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookCall = () => {
    // Cal.com integration would go here
    window.open('https://cal.com', '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          {!isExpanded ? (
            // Compact floating button
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                y: [0, -8, 0],
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.3)",
                  "0 0 40px rgba(168, 85, 247, 0.5)",
                  "0 0 20px rgba(168, 85, 247, 0.3)"
                ]
              }}
              transition={{ 
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-2xl px-6 py-4 h-auto rounded-full group"
                onClick={() => setIsExpanded(true)}
              >
                <Calendar className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Book Free Call
              </Button>
            </motion.div>
          ) : (
            // Expanded card
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-80"
            >
              <Card className="p-6 glass glow-primary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Book Your Free Call</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a personalized demo & strategy session
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>15-minute strategy call</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Custom implementation plan</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>ROI calculator & projections</span>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      className="w-full bg-gradient-primary hover:opacity-90 glow-primary"
                      onClick={handleBookCall}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Phone call simulation
                        window.open('tel:+1-555-123-4567', '_self');
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Us Instead
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};