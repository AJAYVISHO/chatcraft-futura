import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Copy, Code, Eye, Smartphone, Monitor, Tablet, Key } from 'lucide-react';
import { ChatInterface } from '../ChatInterface';
import { useToast } from '@/hooks/use-toast';

interface PreviewEmbedStepProps {
  data: {
    chatbotName: string;
    businessName: string;
    industry: string;
    businessLocation: string;
    supportPhone: string;
    manualContent: string;
    avatar: string;
    greeting: string;
    enableTyping: boolean;
    userBubbleColor: string;
    aiBubbleColor: string;
    isDarkMode: boolean;
    embedWidth: string;
    embedHeight: string;
    embedTheme: string;
    openRouterApiKey?: string;
  };
  updateData: (updates: any) => void;
}

export const PreviewEmbedStep: React.FC<PreviewEmbedStepProps> = ({ data, updateData }) => {
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const scriptCode = `<!-- Floating Chatbot Widget -->
<script>
  (function() {
    var div = document.createElement('div');
    div.id = 'chatbot-widget';
    document.body.appendChild(div);
    
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/embed/CHATBOT_ID_HERE';
    iframe.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 100vw; height: 100vh; border: none; pointer-events: none; z-index: 9999;';
    iframe.onload = function() {
      iframe.style.pointerEvents = 'auto';
    };
    
    div.appendChild(iframe);
  })();
</script>

<!-- Alternative: Simple iframe embed -->
<iframe
  src="${baseUrl}/embed/CHATBOT_ID_HERE"
  style="position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 9999;"
  title="${data.chatbotName} - ${data.businessName}"
></iframe>`;
    return scriptCode;
  };

  const generateReactCode = () => {
    return `import { ChatWidget } from '@your-company/chatbot-react';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <ChatWidget
        botName="${data.chatbotName}"
        businessName="${data.businessName}"
        avatar="${data.avatar}"
        greeting="${data.greeting}"
        theme="${data.embedTheme}"
        userColor="${data.userBubbleColor}"
        botColor="${data.aiBubbleColor}"
        enableTyping={${data.enableTyping}}
        width="${data.embedWidth}px"
        height="${data.embedHeight}px"
      />
    </div>
  );
}`;
  };

  const generateNextJSCode = () => {
    return `import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('@your-company/chatbot-react').then(mod => mod.ChatWidget),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div>
      {/* Your page content */}
      
      <ChatWidget
        botName="${data.chatbotName}"
        businessName="${data.businessName}"
        avatar="${data.avatar}"
        greeting="${data.greeting}"
        theme="${data.embedTheme}"
        userColor="${data.userBubbleColor}"
        botColor="${data.aiBubbleColor}"
        enableTyping={${data.enableTyping}}
        width="${data.embedWidth}px"
        height="${data.embedHeight}px"
      />
    </div>
  );
}`;
  };

  const generateVueCode = () => {
    const baseUrl = window.location.origin;
    const chatbotUrl = `${baseUrl}/embed/${data.chatbotName ? encodeURIComponent(data.chatbotName.replace(/\s+/g, '-').toLowerCase()) : 'chatbot'}`;
    
    return `<template>
  <div class="chatbot-container">
    <iframe
      :src="chatbotUrl"
      :width="width"
      :height="height"
      frameborder="0"
      :style="iframeStyle"
      title="AI Chatbot"
    />
  </div>
</template>

<script>
export default {
  name: 'AIChatbot',
  data() {
    return {
      chatbotUrl: '${chatbotUrl}',
      width: '${data.embedWidth}',
      height: '${data.embedHeight}'
    }
  }
}
</script>`;
  };

  const generateAngularCode = () => {
    const baseUrl = window.location.origin;
    const chatbotUrl = `${baseUrl}/embed/${data.chatbotName ? encodeURIComponent(data.chatbotName.replace(/\s+/g, '-').toLowerCase()) : 'chatbot'}`;
    
    return `// chatbot.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-chatbot',
  template: \`
    <div class="chatbot-container">
      <iframe
        [src]="chatbotUrl"
        [width]="width"
        [height]="height"
        frameborder="0"
        title="AI Chatbot">
      </iframe>
    </div>
  \`
})
export class ChatbotComponent {
  chatbotUrl = '${chatbotUrl}';
  width = '${data.embedWidth}';
  height = '${data.embedHeight}';
}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: `${type} code has been copied to your clipboard.`,
    });
  };

  const getPreviewWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
          Preview & Embed Code
        </h2>
        <p className="text-muted-foreground">
          See how your chatbot looks and get the embed code
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Live Preview
            </Label>
            
            <div className="flex gap-2">
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
                className="neu-button"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
                className="neu-button"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
                className="neu-button"
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Card className="glass-card p-4 bg-muted/20">
            <div 
              className="mx-auto transition-all duration-300"
              style={{ width: getPreviewWidth(), maxWidth: '100%' }}
            >
              <ChatInterface
                botName={data.chatbotName}
                businessName={data.businessName}
                avatar={data.avatar}
                greeting={data.greeting}
                enableTyping={data.enableTyping}
                userBubbleColor={data.userBubbleColor}
                aiBubbleColor={data.aiBubbleColor}
                isDarkMode={data.isDarkMode}
                chatbotConfig={{
                  name: data.chatbotName,
                  businessName: data.businessName,
                  industry: data.industry || 'General',
                  location: data.businessLocation || 'Not specified',
                  contactPhone: data.supportPhone || 'Not provided',
                  ragContent: data.manualContent || 'No specific knowledge base provided.'
                }}
                userApiKey={data.openRouterApiKey}
              />
            </div>
          </Card>


          {/* Embed Settings */}
          <Card className="glass-card p-6">
            <h3 className="font-medium text-foreground mb-4">Embed Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="embedWidth" className="text-sm font-medium">Width</Label>
                <Input
                  id="embedWidth"
                  value={data.embedWidth}
                  onChange={(e) => updateData({ embedWidth: e.target.value })}
                  className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="embedHeight" className="text-sm font-medium">Height</Label>
                <Input
                  id="embedHeight"
                  value={data.embedHeight}
                  onChange={(e) => updateData({ embedHeight: e.target.value })}
                  className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Theme</Label>
                <Select value={data.embedTheme} onValueChange={(value) => updateData({ embedTheme: value })}>
                  <SelectTrigger className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border/50">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Embed Code Section */}
        <div className="space-y-6">
          <Label className="text-lg font-medium flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Embed Code
          </Label>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">HTML Iframe</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generateEmbedCode()}
                  readOnly
                  rows={8}
                  className="font-mono text-sm bg-card/50 border-border/50"
                />
                <Button
                  onClick={() => copyToClipboard(generateEmbedCode(), 'HTML')}
                  className="absolute top-2 right-2 neu-button"
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="react" className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generateReactCode()}
                  readOnly
                  rows={12}
                  className="font-mono text-sm bg-card/50 border-border/50"
                />
                <Button
                  onClick={() => copyToClipboard(generateReactCode(), 'React')}
                  className="absolute top-2 right-2 neu-button"
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="nextjs" className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generateNextJSCode()}
                  readOnly
                  rows={14}
                  className="font-mono text-sm bg-card/50 border-border/50"
                />
                <Button
                  onClick={() => copyToClipboard(generateNextJSCode(), 'Next.js')}
                  className="absolute top-2 right-2 neu-button"
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <h4 className="font-medium text-foreground mb-2">Integration Notes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Copy the code and paste it into your website</li>
              <li>• For React/Next.js, install our package first</li>
              <li>• Customize the width/height to fit your layout</li>
              <li>• The chatbot will automatically handle responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};