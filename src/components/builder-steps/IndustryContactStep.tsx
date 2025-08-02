import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

interface IndustryContactStepProps {
  data: {
    industry: string;
    customIndustry?: string;
    businessLocation: string;
    supportPhone: string;
    supportEmail: string;
  };
  updateData: (updates: any) => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'E-commerce',
  'Education',
  'Finance',
  'Real Estate',
  'Restaurant',
  'Consulting',
  'Manufacturing',
  'Others'
];

export const IndustryContactStep: React.FC<IndustryContactStepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
          Industry & Contact Information
        </h2>
        <p className="text-muted-foreground">
          Help us understand your business better
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Industry Type
          </Label>
          <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
            <SelectTrigger className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/50">
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.industry === 'Others' && (
          <div className="space-y-2">
            <Label htmlFor="customIndustry" className="text-sm font-medium">
              Specify Industry
            </Label>
            <Input
              id="customIndustry"
              placeholder="Enter your industry"
              value={data.customIndustry || ''}
              onChange={(e) => updateData({ customIndustry: e.target.value })}
              className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="businessLocation" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Business Location
          </Label>
          <Input
            id="businessLocation"
            placeholder="e.g., New York, USA"
            value={data.businessLocation}
            onChange={(e) => updateData({ businessLocation: e.target.value })}
            className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportPhone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Support Phone
          </Label>
          <Input
            id="supportPhone"
            placeholder="e.g., +1 (555) 123-4567"
            value={data.supportPhone}
            onChange={(e) => updateData({ supportPhone: e.target.value })}
            className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportEmail" className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Support Email
          </Label>
          <Input
            id="supportEmail"
            type="email"
            placeholder="e.g., support@yourcompany.com"
            value={data.supportEmail}
            onChange={(e) => updateData({ supportEmail: e.target.value })}
            className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Building2 className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Industry Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Selecting your industry helps us optimize the chatbot's responses and suggest relevant features for your business type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};