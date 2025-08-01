import React, { useState, useEffect } from 'react';
import { ChatbotBuilder } from '@/components/ChatbotBuilder';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

type ViewMode = 'dashboard' | 'builder';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [editingChatbotId, setEditingChatbotId] = useState<string | undefined>();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  const handleCreateNew = () => {
    setEditingChatbotId(undefined);
    setCurrentView('builder');
  };

  const handleEditChatbot = (chatbotId: string) => {
    setEditingChatbotId(chatbotId);
    setCurrentView('builder');
  };

  const handleSaved = () => {
    setCurrentView('dashboard');
    setEditingChatbotId(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen animated-gradient">
      {currentView === 'dashboard' ? (
        <div className="container mx-auto py-8 px-4">
          <Dashboard onCreateNew={handleCreateNew} onEditChatbot={handleEditChatbot} />
        </div>
      ) : (
        <ChatbotBuilder editingChatbotId={editingChatbotId} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default Index;
