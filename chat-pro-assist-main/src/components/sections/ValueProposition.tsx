import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Zap, Target, Users, Clock, TrendingUp, Shield } from 'lucide-react';

const services = [
  {
    icon: Phone,
    title: 'Automated Call Handling',
    description: 'AI-powered receptionist that answers every call with human-like conversation, capturing essential customer information.',
    features: ['24/7 Availability', 'Natural Conversations', 'Multi-language Support']
  },
  {
    icon: Target,
    title: 'Lead Qualification & Scoring',
    description: 'Intelligent system that identifies hot prospects and prioritizes them based on your custom criteria.',
    features: ['Smart Scoring', 'Real-time Analysis', 'Custom Criteria']
  },
  {
    icon: Zap,
    title: 'Instant CRM Integration',
    description: 'Seamlessly sync qualified leads directly to your existing CRM or send via email/SMS notifications.',
    features: ['Real-time Sync', 'Multiple CRM Support', 'Automated Workflows']
  }
];

const stats = [
  { number: '3x', label: 'More Qualified Leads', icon: TrendingUp },
  { number: '24/7', label: 'Never Miss a Call', icon: Clock },
  { number: '95%', label: 'Customer Satisfaction', icon: Users },
  { number: '100%', label: 'Data Security', icon: Shield }
];

export const ValueProposition = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="features" ref={ref} className="py-20 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-4 text-accent font-medium">
            Core Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to Scale Your Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI assistant doesn't just answer calls—it transforms them into qualified opportunities
            that drive real business growth.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ y: 50, opacity: 0, rotateX: 15 }}
              animate={isInView ? { y: 0, opacity: 1, rotateX: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="p-8 h-full glass hover-lift hover-glow group">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <service.icon className="w-8 h-8 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {index === 0 ? 'Trusted' : index === 1 ? 'Smart' : 'Efficient'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                </div>
                
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                      {feature}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 200
              }}
            >
              <Card className="p-6 text-center glass hover-lift">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};