import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Sarah Johnson',
    company: 'TechStart Solutions',
    role: 'CEO',
    avatar: '1',
    rating: 5,
    text: 'Our lead conversion increased by 3x within the first month. The AI assistant handles calls better than our previous receptionist and never misses a potential customer.',
    metrics: { leads: '+3x', satisfaction: '98%', calls: '500+' }
  },
  {
    name: 'Michael Chen',
    company: 'Growth Marketing Pro',
    role: 'Founder',
    avatar: '2',
    rating: 5,
    text: 'Game-changer for our agency. We can now focus on strategy while the AI handles all incoming calls and qualifies leads perfectly. ROI was immediate.',
    metrics: { leads: '+250%', satisfaction: '96%', calls: '1200+' }
  },
  {
    name: 'Emily Rodriguez',
    company: 'Local Home Services',
    role: 'Operations Manager',
    avatar: '3',
    rating: 5,
    text: 'The 24/7 availability is incredible. We capture leads even when the office is closed. The AI understands our services and asks all the right questions.',
    metrics: { leads: '+180%', satisfaction: '99%', calls: '800+' }
  },
  {
    name: 'David Park',
    company: 'SaaS Innovations',
    role: 'Head of Sales',
    avatar: '4',
    rating: 5,
    text: 'Integration with our CRM was seamless. Every qualified lead comes with detailed notes and next steps. Our sales team loves the quality of leads we get now.',
    metrics: { leads: '+220%', satisfaction: '97%', calls: '2000+' }
  }
];

const companies = [
  'TechCorp', 'InnovateLabs', 'GrowthCo', 'ScaleUp', 'FutureWorks', 'NextGen'
];

export const Testimonials = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" ref={ref} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            Customer Success
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What Our{' '}
            <span className="text-4xl md:text-5xl font-bold mb-6">
              Customers Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of businesses that have transformed their customer acquisition with our AI assistant
          </p>
        </motion.div>

        {/* Main Testimonial Carousel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-16"
        >
          <Card className="p-8 md:p-12 glass max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground glow-primary">
                  {testimonials[currentIndex].avatar}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <Quote className="w-8 h-8 text-accent mb-4 mx-auto md:mx-0" />
                <p className="text-xl md:text-2xl mb-6 leading-relaxed">
                  "{testimonials[currentIndex].text}"
                </p>
                
                {/* Rating */}
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="mb-6">
                  <h4 className="font-bold text-lg">{testimonials[currentIndex].name}</h4>
                  <p className="text-muted-foreground">
                    {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{testimonials[currentIndex].metrics.leads}</div>
                    <div className="text-sm text-muted-foreground">More Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{testimonials[currentIndex].metrics.satisfaction}</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{testimonials[currentIndex].metrics.calls}</div>
                    <div className="text-sm text-muted-foreground">Calls Handled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevTestimonial}
                className="hover:bg-primary/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-2 items-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextTestimonial}
                className="hover:bg-primary/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Company Logos Carousel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-8">Trusted by leading companies worldwide</p>
          <div className="flex justify-center items-center gap-8 md:gap-12 overflow-hidden">
            <motion.div
              className="flex gap-8 md:gap-12"
              animate={{ x: [-100, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[...companies, ...companies].map((company, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 text-2xl font-bold text-muted-foreground/50 hover:text-accent transition-colors cursor-pointer"
                >
                  {company}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};