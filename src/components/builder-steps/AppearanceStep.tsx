import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Palette, Moon, Sun, MessageCircle, Upload, Sparkles, Clock } from 'lucide-react';

interface AppearanceStepProps {
  data: {
    avatar: string;
    isDarkMode: boolean;
    greeting: string;
    enableTyping: boolean;
    userBubbleColor: string;
    aiBubbleColor: string;
    autoGreeting: boolean;
  };
  updateData: (updates: any) => void;
}

const avatarPresets = ['🤖', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍⚕️', '👩‍⚕️', '🦸‍♂️', '🦸‍♀️'];
const colorPresets = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#8b5cf6',
  orange: '#f97316',
  pink: '#ec4899'
};

export const AppearanceStep: React.FC<AppearanceStepProps> = ({ data, updateData }) => {
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateData({ avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
          Appearance & Customization
        </h2>
        <p className="text-muted-foreground">
          Customize how your chatbot looks and behaves
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <Label className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Avatar
            </Label>
            
            <div className="flex items-center gap-4">
              <div className="text-6xl p-4 bg-card/50 rounded-2xl">
                {typeof data.avatar === 'string' && data.avatar.startsWith('data:') ? (
                  <img src={data.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  data.avatar
                )}
              </div>
              
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatarUpload"
                />
                <Button variant="outline" className="neu-button" asChild>
                  <label htmlFor="avatarUpload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </label>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {avatarPresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`p-3 text-2xl neu-button ${data.avatar === preset ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => updateData({ avatar: preset })}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl">
            <div className="flex items-center gap-3">
              {data.isDarkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <div>
                <Label className="font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Enable dark theme for the chat</p>
              </div>
            </div>
            <Switch
              checked={data.isDarkMode}
              onCheckedChange={(checked) => updateData({ isDarkMode: checked })}
            />
          </div>

          {/* Typing Animation */}
          <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <Label className="font-medium">Typing Animation</Label>
                <p className="text-sm text-muted-foreground">Show typing indicator when bot is responding</p>
              </div>
            </div>
            <Switch
              checked={data.enableTyping}
              onCheckedChange={(checked) => updateData({ enableTyping: checked })}
            />
          </div>

          {/* Auto Greeting */}
          <div className="flex items-center justify-between p-4 bg-card/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <Label className="font-medium">Auto Greeting</Label>
                <p className="text-sm text-muted-foreground">Show greeting automatically when widget opens</p>
              </div>
            </div>
            <Switch
              checked={data.autoGreeting}
              onCheckedChange={(checked) => updateData({ autoGreeting: checked })}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Greeting Message */}
          <div className="space-y-2">
            <Label htmlFor="greeting" className="text-lg font-medium">
              Welcome Message
            </Label>
            <Input
              id="greeting"
              placeholder="Hello! How can I help you today?"
              value={data.greeting}
              onChange={(e) => updateData({ greeting: e.target.value })}
              className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              This message will be shown when users start chatting
            </p>
          </div>

          {/* Chat Bubble Colors */}
          <div className="space-y-4">
            <Label className="text-lg font-medium flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Chat Bubble Colors
            </Label>
            
            {/* User Bubble Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">User Message Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.userBubbleColor}
                  onChange={(e) => updateData({ userBubbleColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                />
                <Input
                  value={data.userBubbleColor}
                  onChange={(e) => updateData({ userBubbleColor: e.target.value })}
                  className="flex-1 neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                {Object.entries(colorPresets).map(([name, color]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    style={{ backgroundColor: color }}
                    className="w-8 h-8 p-0 rounded-full border-2"
                    onClick={() => updateData({ userBubbleColor: color })}
                  />
                ))}
              </div>
            </div>

            {/* AI Bubble Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">AI Message Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.aiBubbleColor}
                  onChange={(e) => updateData({ aiBubbleColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                />
                <Input
                  value={data.aiBubbleColor}
                  onChange={(e) => updateData({ aiBubbleColor: e.target.value })}
                  className="flex-1 neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                {Object.entries(colorPresets).map(([name, color]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    style={{ backgroundColor: color }}
                    className="w-8 h-8 p-0 rounded-full border-2"
                    onClick={() => updateData({ aiBubbleColor: color })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 p-6 bg-card/30 border border-border/50 rounded-xl">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Preview
        </h3>
        <div className="space-y-4 max-w-md">
          {/* Bot Message */}
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {typeof data.avatar === 'string' && data.avatar.startsWith('data:') ? (
                <img src={data.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-lg">{data.avatar}</span>
              )}
            </div>
            <div
              className="px-4 py-2 rounded-2xl rounded-bl-md max-w-xs text-sm"
              style={{ backgroundColor: data.aiBubbleColor, color: '#000' }}
            >
              {data.greeting}
            </div>
          </div>
          
          {/* User Message */}
          <div className="flex items-start gap-3 justify-end">
            <div
              className="px-4 py-2 rounded-2xl rounded-br-md max-w-xs text-sm text-white"
              style={{ backgroundColor: data.userBubbleColor }}
            >
              Hello! I need help with my order.
            </div>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
              U
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};