import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Building } from 'lucide-react';

interface GeneralInfoStepProps {
  data: {
    chatbotName: string;
    businessName: string;
  };
  updateData: (updates: any) => void;
}

export const GeneralInfoStep: React.FC<GeneralInfoStepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
          General Information
        </h2>
        <p className="text-muted-foreground">
          Let's start with the basics about your chatbot
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="chatbotName" className="text-sm font-medium flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            Chatbot Name
          </Label>
          <Input
            id="chatbotName"
            placeholder="e.g., Support Assistant"
            value={data.chatbotName}
            onChange={(e) => updateData({ chatbotName: e.target.value })}
            className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground">
            This will be the display name of your chatbot
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Business Name
          </Label>
          <Input
            id="businessName"
            placeholder="e.g., Acme Corporation"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
            className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground">
            Your company or organization name
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Pro Tip</h3>
            <p className="text-sm text-muted-foreground">
              Choose a friendly and memorable name for your chatbot. This helps create a more personal connection with your users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};