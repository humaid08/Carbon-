import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const CHAT_URL = 'https://kprydlijsjygdpuoylwj.supabase.co/functions/v1/chat';

export const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens
      setTimeout(() => {
        addBotMessage("Hi! I'm Carbon AI's assistant. I'm here to tell you all about how Carbon AI helps businesses never miss a call or lose a lead with 24/7 AI-powered call handling. What would you like to know about our service?", [
          "Tell me about Carbon AI",
          "How does it work?",
          "What are the features?",
          "Pricing information"
        ]);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, suggestions?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, message]);
    setIsTyping(false);
  };

  const addUserMessage = async (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    setInputText('');
    await handleBotResponse([...messages, message]);
  };

  const handleBotResponse = async (conversationHistory: Message[]) => {
    setIsTyping(true);
    
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory.map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          addBotMessage("I'm receiving too many requests right now. Please try again in a moment.");
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Service Unavailable",
            description: "AI service requires payment. Please contact support.",
            variant: "destructive",
          });
          addBotMessage("I'm temporarily unavailable. Please try again later or contact support.");
          return;
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Could you try rephrasing?";
      
      addBotMessage(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
      addBotMessage("I'm having trouble responding right now. Please try again.");
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      addUserMessage(inputText);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Button
                size="lg"
                onClick={() => setIsOpen(true)}
                className="bg-gradient-primary hover:opacity-90 rounded-full w-16 h-16 p-0 glow-primary shadow-2xl group"
              >
                <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </Button>
            </motion.div>
            
            {/* Notification Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <Badge className="bg-red-500 text-white px-2 py-1 text-xs animate-pulse">
                1
              </Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 w-96 h-[500px]"
          >
            <Card className="h-full flex flex-col glass glow-primary">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] ${message.isBot ? 'bg-muted' : 'bg-gradient-primary text-primary-foreground'} rounded-2xl px-4 py-2`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => addUserMessage(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={!inputText.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};