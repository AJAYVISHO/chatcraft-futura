import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  botName: string;
  businessName: string;
  avatar: string;
  greeting: string;
  enableTyping: boolean;
  userBubbleColor: string;
  aiBubbleColor: string;
  isDarkMode?: boolean;
  chatbotConfig?: any;
  userApiKey?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  botName,
  businessName,
  avatar,
  greeting,
  enableTyping,
  userBubbleColor,
  aiBubbleColor,
  isDarkMode = false,
  chatbotConfig,
  userApiKey
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: greeting,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    if (enableTyping) {
      setIsTyping(true);
    }

    try {
      // Prepare messages for API call
      const chatMessages = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add current user message
      chatMessages.push({
        role: 'user',
        content: currentInput
      });

      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: chatMessages,
          chatbotConfig: chatbotConfig || {
            name: botName,
            businessName,
            industry: 'General',
            location: 'Not specified',
            contactPhone: 'Not provided',
            ragContent: 'No specific knowledge base provided.'
          },
          userApiKey
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error.message}. Please check your API configuration and try again.`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`glass-card w-full max-w-md mx-auto h-96 flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <div className="text-2xl">
          {typeof avatar === 'string' && avatar.startsWith('data:') ? (
            <img src={avatar} alt="Bot Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span>{avatar}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{botName}</h3>
          <p className="text-xs text-muted-foreground">{businessName}</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="text-lg">
                {typeof avatar === 'string' && avatar.startsWith('data:') ? (
                  <img src={avatar} alt="Bot Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="text-sm">{avatar}</span>
                )}
              </div>
            )}
            
            <div
              className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${
                message.isUser
                  ? 'rounded-br-md text-white'
                  : 'rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.isUser ? userBubbleColor : aiBubbleColor,
                color: message.isUser ? '#ffffff' : '#000000'
              }}
            >
              {message.content}
            </div>

            {message.isUser && (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="text-lg">
              {typeof avatar === 'string' && avatar.startsWith('data:') ? (
                <img src={avatar} alt="Bot Avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="text-sm">{avatar}</span>
              )}
            </div>
            <div 
              className="px-3 py-2 rounded-2xl rounded-bl-md text-sm typing-indicator"
              style={{ backgroundColor: aiBubbleColor, color: '#000000' }}
            >
              Typing
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="neu-button"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};