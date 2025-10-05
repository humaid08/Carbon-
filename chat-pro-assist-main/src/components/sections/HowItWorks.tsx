import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Zap, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Phone,
    title: 'Customer Calls Your Number',
    description: 'Your customer dials your business number and our AI assistant answers instantly, providing a warm, professional greeting.',
    details: ['Natural voice interaction', 'Brand-customized greetings', 'Multiple language support']
  },
  {
    step: 2,
    icon: MessageCircle,
    title: 'AI Handles the Conversation',
    description: 'Our intelligent assistant engages in natural conversation, asks qualifying questions, and captures all essential information.',
    details: ['Smart questioning flow', 'Lead qualification scoring', 'Real-time conversation analysis']
  },
  {
    step: 3,
    icon: Zap,
    title: 'Instant Lead Delivery',
    description: 'Qualified leads are instantly delivered to your CRM, email, or SMS with complete conversation details and next-step recommendations.',
    details: ['Real-time CRM sync', 'Detailed conversation logs', 'Priority lead alerts']
  }
];

export const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="how-it-works" ref={ref} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            3 Simple Steps
            <br />
            to Transform Your Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI assistant seamlessly integrates into your existing workflow, 
            turning every call into a potential opportunity.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent transform -translate-y-1/2" />
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative"
              >
                {/* Step Number */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center glow-primary z-10 relative">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-accent-foreground">
                      {step.step}
                    </div>
                  </div>
                </div>

                <Card className="p-8 text-center glass hover-lift hover-glow h-full">
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  
                  <div className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center justify-center text-sm">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-8 h-8 text-accent" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-secondary rounded-3xl p-8 glass">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join hundreds of businesses already using our AI assistant to capture more leads
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-medium glow-primary hover-lift"
            >
              Start Your Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};
