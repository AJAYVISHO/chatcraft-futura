import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EmbeddableChat } from '@/components/EmbeddableChat';
import { supabase } from '@/integrations/supabase/client';

interface ChatbotConfig {
  id: string;
  business_name: string;
  industry_type: string;
  location: string;
  contact_phone: string;
  rag_content: string;
  config: any;
}

const ChatEmbed: React.FC = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatbotConfig = async () => {
      if (!chatbotId) {
        setError('Chatbot ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chatbots')
          .select('*')
          .eq('id', chatbotId)
          .single();

        if (error) {
          console.error('Error fetching chatbot:', error);
          setError('Chatbot not found');
        } else {
          setConfig(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load chatbot');
      } finally {
        setLoading(false);
      }
    };

    fetchChatbotConfig();
  }, [chatbotId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading chatbot...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Chatbot not found'}</p>
          <p className="text-gray-500">Please check the chatbot ID and try again.</p>
        </div>
      </div>
    );
  }

  const chatbotConfig = config.config || {};
  
  return (
    <div className="min-h-screen bg-transparent">
      <EmbeddableChat
        botName={chatbotConfig.chatbotName || 'AI Assistant'}
        businessName={config.business_name}
        avatar={chatbotConfig.avatar || ''}
        greeting={chatbotConfig.greeting || 'Hello! How can I help you today?'}
        userBubbleColor={chatbotConfig.userBubbleColor || '#3b82f6'}
        aiBubbleColor={chatbotConfig.aiBubbleColor || '#f1f5f9'}
        theme={chatbotConfig.isDarkMode ? 'dark' : 'light'}
        chatbotId={config.id}
        autoGreeting={chatbotConfig.autoGreeting || false}
      />
    </div>
  );
};

export default ChatEmbed;