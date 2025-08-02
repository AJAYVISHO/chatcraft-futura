import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface EmbeddableChatProps {
  botName: string;
  businessName: string;
  avatar?: string;
  greeting?: string;
  userBubbleColor?: string;
  aiBubbleColor?: string;
  theme?: 'light' | 'dark';
  chatbotId: string;
  autoGreeting?: boolean; // New prop for auto-greeting behavior
  floatingPosition?: 'bottom-right' | 'bottom-left';
}

export const EmbeddableChat: React.FC<EmbeddableChatProps> = ({
  botName,
  businessName,
  avatar,
  greeting = "Hello! How can I help you today?",
  userBubbleColor = "#3b82f6",
  aiBubbleColor = "#f1f5f9",
  theme = 'light',
  chatbotId,
  autoGreeting = false,
  floatingPosition = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-greeting logic
  useEffect(() => {
    if (autoGreeting && !hasAutoGreeted && isOpen) {
      const timer = setTimeout(() => {
        setMessages([{
          content: greeting,
          sender: 'ai',
          timestamp: new Date()
        }]);
        setHasAutoGreeted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoGreeting, hasAutoGreeted, isOpen, greeting]);

  // Manual greeting when opened without auto-greeting
  useEffect(() => {
    if (isOpen && !autoGreeting && messages.length === 0) {
      setMessages([{
        content: greeting,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, autoGreeting, messages.length, greeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/functions/v1/chat-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatbotId: chatbotId,
          conversationHistory: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const aiMessage: Message = {
        content: data.response || "I'm sorry, I couldn't process your request at the moment.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const positionClass = floatingPosition === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  return (
    <div className={`fixed ${positionClass} z-50 font-sans`}>
      {/* Chat Widget */}
      {isOpen && (
        <Card className={`mb-4 w-80 h-96 flex flex-col shadow-2xl border ${themeClasses}`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatar} alt={botName} />
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {botName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{botName}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {businessName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.sender === 'user'
                      ? `text-white`
                      : `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`
                  }`}
                  style={{
                    backgroundColor: message.sender === 'user' ? userBubbleColor : 
                                   (message.sender === 'ai' && theme === 'light') ? aiBubbleColor : undefined
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`rounded-lg p-3 text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                size="sm"
                style={{ backgroundColor: userBubbleColor }}
                className="px-3 text-white hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg text-white hover:scale-105 transition-transform"
        style={{ backgroundColor: userBubbleColor }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
};