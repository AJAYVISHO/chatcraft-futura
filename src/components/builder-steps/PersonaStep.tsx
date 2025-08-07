import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { User, Bot, MessageCircle, Globe, Zap, Sparkles } from 'lucide-react';

interface PersonaStepProps {
  data: {
    agentName: string;
    agentRole: string;
    agentDescription: string;
    chattiness: number;
    defaultLanguage: string;
    toneOfVoice: string;
    responseStyle: string;
    specialInstructions: string;
  };
  updateData: (updates: any) => void;
}

const rolePresets = [
  'Customer Support Agent',
  'Sales Representative', 
  'Technical Support Specialist',
  'Human Resources Agent',
  'Healthcare Assistant',
  'Financial Advisor',
  'Educational Tutor',
  'Real Estate Agent',
  'Travel Consultant',
  'Marketing Assistant'
];

const toneOptions = [
  { value: 'friendly', label: '😊 Friendly', description: 'Warm and approachable' },
  { value: 'professional', label: '💼 Professional', description: 'Formal and businesslike' },
  { value: 'casual', label: '😎 Casual', description: 'Relaxed and informal' },
  { value: 'empathetic', label: '🤗 Empathetic', description: 'Understanding and caring' },
  { value: 'authoritative', label: '🎯 Authoritative', description: 'Confident and knowledgeable' },
  { value: 'playful', label: '🎮 Playful', description: 'Fun and energetic' },
];

const languageOptions = [
  { value: 'en', label: '🇺🇸 English', flag: '🇺🇸' },
  { value: 'es', label: '🇪🇸 Spanish', flag: '🇪🇸' },
  { value: 'fr', label: '🇫🇷 French', flag: '🇫🇷' },
  { value: 'de', label: '🇩🇪 German', flag: '🇩🇪' },
  { value: 'it', label: '🇮🇹 Italian', flag: '🇮🇹' },
  { value: 'pt', label: '🇵🇹 Portuguese', flag: '🇵🇹' },
  { value: 'zh', label: '🇨🇳 Chinese', flag: '🇨🇳' },
  { value: 'ja', label: '🇯🇵 Japanese', flag: '🇯🇵' },
];

const responseStyleOptions = [
  { value: 'concise', label: 'Concise', description: 'Short and to the point' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive explanations' },
  { value: 'conversational', label: 'Conversational', description: 'Natural dialogue flow' },
  { value: 'structured', label: 'Structured', description: 'Organized with bullet points' },
];

export const PersonaStep: React.FC<PersonaStepProps> = ({ data, updateData }) => {
  const chattinessLabels = ['Minimal\n1 sentence', 'Brief\n2-3 sentences', 'Standard\n4-5 sentences', 'Chatty\n6+ sentences'];
  
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
          AI Persona Configuration
        </h2>
        <p className="text-muted-foreground">
          Define how your AI agent communicates and behaves
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Agent Name */}
          <div className="space-y-3">
            <Label htmlFor="agentName" className="text-lg font-medium flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Agent Name
            </Label>
            <Input
              id="agentName"
              placeholder="Alex"
              value={data.agentName}
              onChange={(e) => updateData({ agentName: e.target.value })}
              className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-sm text-muted-foreground">
              Give your agent a name that will be displayed in conversations
            </p>
          </div>

          {/* Agent Role */}
          <div className="space-y-3">
            <Label htmlFor="agentRole" className="text-lg font-medium flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Agent Role
            </Label>
            <div className="space-y-2">
              <Input
                id="agentRole"
                placeholder="Customer Support Agent"
                value={data.agentRole}
                onChange={(e) => updateData({ agentRole: e.target.value })}
                className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex flex-wrap gap-2">
                {rolePresets.map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    size="sm"
                    onClick={() => updateData({ agentRole: role })}
                    className="text-xs neu-button hover:bg-primary/10"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Describe your agent's job title or primary function
            </p>
          </div>

          {/* Agent Description */}
          <div className="space-y-3">
            <Label htmlFor="agentDescription" className="text-lg font-medium flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Agent Description
            </Label>
            <Textarea
              id="agentDescription"
              placeholder="I'm here to help you with all your customer service needs. I can answer questions about our products, help with orders, and resolve any issues you might have."
              value={data.agentDescription}
              onChange={(e) => updateData({ agentDescription: e.target.value })}
              rows={4}
              className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <p className="text-sm text-muted-foreground">
              A brief description of what your agent does and how it can help users
            </p>
          </div>

          {/* Chattiness Level */}
          <div className="space-y-4">
            <Label className="text-lg font-medium flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Chattiness Level
            </Label>
            <div className="px-4 py-6 bg-card/50 rounded-xl">
              <div className="space-y-4">
                <Slider
                  value={[data.chattiness]}
                  onValueChange={(value) => updateData({ chattiness: value[0] })}
                  max={3}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {chattinessLabels.map((label, index) => (
                    <div key={index} className="text-center flex-1">
                      <div className={`whitespace-pre-line ${data.chattiness === index ? 'text-primary font-medium' : ''}`}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Control how detailed your agent's responses will be
            </p>
          </div>
        </div>

        {/* Right Column - Communication Style */}
        <div className="space-y-6">
          {/* Default Language */}
          <div className="space-y-3">
            <Label className="text-lg font-medium flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Default Language
            </Label>
            <Select value={data.defaultLanguage} onValueChange={(value) => updateData({ defaultLanguage: value })}>
              <SelectTrigger className="neu-button border-0 bg-card/50">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The primary language your agent will use to communicate
            </p>
          </div>

          {/* Tone of Voice */}
          <div className="space-y-3">
            <Label className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Tone of Voice
            </Label>
            <Select value={data.toneOfVoice} onValueChange={(value) => updateData({ toneOfVoice: value })}>
              <SelectTrigger className="neu-button border-0 bg-card/50">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    <div>
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-xs text-muted-foreground">{tone.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose how your agent should communicate with users
            </p>
          </div>

          {/* Response Style */}
          <div className="space-y-3">
            <Label className="text-lg font-medium">Response Style</Label>
            <Select value={data.responseStyle} onValueChange={(value) => updateData({ responseStyle: value })}>
              <SelectTrigger className="neu-button border-0 bg-card/50">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {responseStyleOptions.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Special Instructions */}
          <div className="space-y-3">
            <Label htmlFor="specialInstructions" className="text-lg font-medium">
              Special Instructions
            </Label>
            <Textarea
              id="specialInstructions"
              placeholder="Always ask for the customer's order number before helping with order-related issues. Escalate refund requests to human support."
              value={data.specialInstructions}
              onChange={(e) => updateData({ specialInstructions: e.target.value })}
              rows={4}
              className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Additional instructions or guidelines for your agent to follow
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 p-6 bg-card/30 border border-border/50 rounded-xl">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Agent Preview
        </h3>
        <div className="space-y-3 max-w-md">
          <div className="text-sm">
            <span className="font-medium text-primary">{data.agentName || 'Agent'}</span>
            <span className="text-muted-foreground"> - {data.agentRole || 'Assistant'}</span>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-sm">
            {data.agentDescription || "I'm here to help you with all your needs. How can I assist you today?"}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-4">
            <span>Language: {languageOptions.find(l => l.value === data.defaultLanguage)?.label || 'English'}</span>
            <span>Tone: {toneOptions.find(t => t.value === data.toneOfVoice)?.label || 'Friendly'}</span>
            <span>Style: {data.chattiness <= 1 ? 'Brief' : data.chattiness >= 3 ? 'Detailed' : 'Standard'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};