import React, { useState, useEffect } from 'react';
import { ChatbotBuilder } from '@/components/ChatbotBuilder';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

type ViewMode = 'dashboard' | 'builder';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  const handleCreateNew = () => {
    setCurrentView('builder');
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
          <Dashboard onCreateNew={handleCreateNew} />
        </div>
      ) : (
        <ChatbotBuilder />
      )}
    </div>
  );
};

export default Index;
