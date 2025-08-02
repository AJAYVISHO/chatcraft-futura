import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oyamwgtjdvqgzljzxuua.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YW13Z3RqZHZxZ3psanp4dXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjA2MjAsImV4cCI6MjA2ODk5NjYyMH0.cV9zP1ITlJRkFVywzMD3We08VUfclLMicwXsUk9HXCw";
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ChatbotData {
  id?: string;
  chatbotName: string;
  businessName: string;
  industry: string;
  customIndustry?: string;
  businessLocation: string;
  supportPhone: string;
  supportEmail: string;
  uploadedFiles: File[];
  manualContent: string;
  websiteLinks: string[];
  avatar: string;
  isDarkMode: boolean;
  greeting: string;
  enableTyping: boolean;
  userBubbleColor: string;
  aiBubbleColor: string;
  embedWidth: string;
  embedHeight: string;
  embedTheme: string;
  openRouterApiKey?: string;
  created_at?: string;
  updated_at?: string;
}

export const useChatbots = () => {
  const [chatbots, setChatbots] = useState<ChatbotData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChatbots = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChatbots = data?.map(chatbot => {
        const config = chatbot.config as any || {};
        return {
          id: chatbot.id,
          chatbotName: config.chatbotName || 'Untitled Chatbot',
          businessName: chatbot.business_name,
          industry: chatbot.industry_type,
          businessLocation: chatbot.location || '',
          supportPhone: chatbot.contact_phone,
          supportEmail: '',
          uploadedFiles: [],
          manualContent: chatbot.rag_content || '',
          websiteLinks: [],
          avatar: config.avatar || '🤖',
          isDarkMode: config.isDarkMode || false,
          greeting: config.greeting || 'Hello! How can I help you today?',
          enableTyping: config.enableTyping || true,
          userBubbleColor: config.userBubbleColor || '#ef4444',
          aiBubbleColor: config.aiBubbleColor || '#f3f4f6',
          embedWidth: config.embedWidth || '400',
          embedHeight: config.embedHeight || '600',
          embedTheme: config.embedTheme || 'light',
          openRouterApiKey: config.openRouterApiKey || '',
          created_at: chatbot.created_at,
          updated_at: chatbot.updated_at
        };
      }) || [];

      setChatbots(formattedChatbots);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast({
        title: "Error",
        description: "Failed to load chatbots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveChatbot = async (chatbotData: ChatbotData): Promise<any> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save chatbots",
        variant: "destructive",
      });
      return null;
    }

    try {
      const dbData = {
        user_id: user.id,
        business_name: chatbotData.businessName,
        industry_type: chatbotData.industry,
        location: chatbotData.businessLocation,
        contact_phone: chatbotData.supportPhone,
        rag_content: chatbotData.manualContent,
        services_offered: '',
        pricing_details: '',
        config: {
          chatbotName: chatbotData.chatbotName,
          avatar: chatbotData.avatar,
          isDarkMode: chatbotData.isDarkMode,
          greeting: chatbotData.greeting,
          enableTyping: chatbotData.enableTyping,
          userBubbleColor: chatbotData.userBubbleColor,
          aiBubbleColor: chatbotData.aiBubbleColor,
          embedWidth: chatbotData.embedWidth,
          embedHeight: chatbotData.embedHeight,
          embedTheme: chatbotData.embedTheme,
          openRouterApiKey: chatbotData.openRouterApiKey
        }
      };

      if (chatbotData.id) {
        // Update existing chatbot
        const { error } = await supabase
          .from('chatbots')
          .update(dbData)
          .eq('id', chatbotData.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new chatbot
        const { error } = await supabase
          .from('chatbots')
          .insert(dbData);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Chatbot ${chatbotData.id ? 'updated' : 'created'} successfully!`,
      });

      fetchChatbots();
      return true;
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast({
        title: "Error",
        description: `Failed to ${chatbotData.id ? 'update' : 'create'} chatbot`,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteChatbot = async (chatbotId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', chatbotId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chatbot deleted successfully!",
      });

      fetchChatbots();
      return true;
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchChatbots();
    }
  }, [user?.id]);

  return {
    chatbots,
    loading,
    saveChatbot,
    deleteChatbot,
    fetchChatbots
  };
};