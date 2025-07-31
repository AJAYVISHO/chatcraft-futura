import React, { useState } from 'react';
import { ChatbotBuilder } from '@/components/ChatbotBuilder';
import { Dashboard } from '@/components/Dashboard';

type ViewMode = 'dashboard' | 'builder';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  const handleCreateNew = () => {
    setCurrentView('builder');
  };

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
