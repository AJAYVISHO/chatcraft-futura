import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Bot, Sparkles } from 'lucide-react';
import { GeneralInfoStep } from './builder-steps/GeneralInfoStep';
import { IndustryContactStep } from './builder-steps/IndustryContactStep';
import { KnowledgebaseStep } from './builder-steps/KnowledgebaseStep';
import { AppearanceStep } from './builder-steps/AppearanceStep';
import { PreviewEmbedStep } from './builder-steps/PreviewEmbedStep';
import { useChatbots, type ChatbotData } from '@/hooks/useChatbots';

const initialData: ChatbotData = {
  chatbotName: '',
  businessName: '',
  industry: '',
  businessLocation: '',
  supportPhone: '',
  supportEmail: '',
  uploadedFiles: [],
  manualContent: '',
  websiteLinks: [],
  avatar: '🤖',
  isDarkMode: false,
  greeting: 'Hello! How can I help you today?',
  enableTyping: true,
  userBubbleColor: '#ef4444',
  aiBubbleColor: '#f3f4f6',
  embedWidth: '400',
  embedHeight: '600',
  embedTheme: 'light',
  openRouterApiKey: '',
  autoGreeting: false
};

const steps = [
  { id: 1, title: 'General Info', description: 'Basic chatbot details' },
  { id: 2, title: 'Industry & Contact', description: 'Business information' },
  { id: 3, title: 'Knowledgebase', description: 'Upload your content' },
  { id: 4, title: 'Appearance', description: 'Customize the look' },
  { id: 5, title: 'Preview & Embed', description: 'Generate embed code' }
];

interface ChatbotBuilderProps {
  editingChatbotId?: string;
  onSaved?: () => void;
}

export const ChatbotBuilder: React.FC<ChatbotBuilderProps> = ({ 
  editingChatbotId, 
  onSaved 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [chatbotData, setChatbotData] = useState<ChatbotData>(initialData);
  const { chatbots, saveChatbot } = useChatbots();

  // Load existing chatbot data if editing
  useEffect(() => {
    if (editingChatbotId && chatbots.length > 0) {
      const existingChatbot = chatbots.find(bot => bot.id === editingChatbotId);
      if (existingChatbot) {
        setChatbotData(existingChatbot);
      }
    }
  }, [editingChatbotId, chatbots]);

  const updateData = (updates: Partial<ChatbotData>) => {
    setChatbotData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <GeneralInfoStep data={chatbotData} updateData={updateData} />;
      case 2:
        return <IndustryContactStep data={chatbotData} updateData={updateData} />;
      case 3:
        return <KnowledgebaseStep data={chatbotData} updateData={updateData} />;
      case 4:
        return <AppearanceStep data={chatbotData} updateData={updateData} />;
      case 5:
        return <PreviewEmbedStep data={chatbotData} updateData={updateData} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return chatbotData.chatbotName.trim() && chatbotData.businessName.trim();
      case 2:
        return chatbotData.industry && chatbotData.businessLocation.trim();
      case 3:
        return chatbotData.uploadedFiles.length > 0 || chatbotData.manualContent.trim() || chatbotData.websiteLinks.length > 0;
      case 4:
        return chatbotData.greeting.trim();
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen animated-gradient py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl animate-glow">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-space-grotesk text-foreground">
              Chatbot Builder
            </h1>
            <Sparkles className="w-6 h-6 text-primary animate-float" />
          </div>
          <p className="text-muted-foreground text-lg">
            Create your intelligent chatbot in just a few steps
          </p>
        </div>

        {/* Progress Section */}
        <Card className="glass-card p-6 mb-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Step {currentStep} of {steps.length}
              </h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            
            <Progress value={progress} className="h-2 mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl text-center transition-all duration-300 ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : currentStep > step.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs opacity-80 mt-1">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Step Content */}
        <Card className="glass-card p-8 mb-8">
          <div className="animate-slide-up">
            {renderStep()}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="neu-button"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gradient-button"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className="gradient-button" 
              onClick={async () => {
                const result = await saveChatbot(chatbotData);
                if (result && onSaved) {
                  onSaved();
                }
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {editingChatbotId ? 'Update Chatbot' : 'Create Chatbot'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};