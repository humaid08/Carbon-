import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Building, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'Perfect for small businesses just getting started',
    icon: Zap,
    popular: false,
    features: [
      'Up to 500 calls/month',
      'Basic AI responses',
      'Email notifications',
      'Standard support',
      'Call analytics dashboard',
      'CRM integration (3 platforms)'
    ]
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'Ideal for growing businesses that need advanced features',
    icon: Building,
    popular: true,
    features: [
      'Up to 2,000 calls/month',
      'Advanced AI conversations',
      'Real-time SMS & email alerts',
      'Priority support',
      'Advanced analytics & reporting',
      'Unlimited CRM integrations',
      'Custom call routing',
      'Lead scoring & qualification'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For large organizations with complex requirements',
    icon: Crown,
    popular: false,
    features: [
      'Unlimited calls',
      'Custom AI training',
      'Dedicated account manager',
      '24/7 premium support',
      'White-label solution',
      'Custom integrations',
      'Advanced security & compliance',
      'Multi-location support'
    ]
  }
];

export const PricingSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const navigate = useNavigate();

  return (
    <section id="pricing" ref={ref} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start capturing more leads today with transparent pricing that scales with your business
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`p-8 text-center glass hover-lift h-full relative ${
                plan.popular ? 'ring-2 ring-primary/20 glow-primary' : ''
              }`}>
                {/* Plan Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-primary glow-primary' 
                      : 'bg-accent/10'
                  }`}>
                    <plan.icon className={`w-8 h-8 ${
                      plan.popular ? 'text-primary-foreground' : 'text-accent'
                    }`} />
                  </div>
                </div>

                {/* Plan Name & Price */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mb-8">{plan.description}</p>

                {/* Features */}
                <div className="space-y-4 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-primary hover:opacity-90 glow-primary'
                      : 'variant-outline'
                  } hover-lift`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-secondary rounded-3xl p-8 glass max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">30-Day Money-Back Guarantee</h3>
            <p className="text-muted-foreground mb-6">
              Try Carbon risk-free for 30 days. If you're not completely satisfied, we'll refund every penny.
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};