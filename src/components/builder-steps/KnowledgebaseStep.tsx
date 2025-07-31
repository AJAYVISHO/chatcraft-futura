import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Plus, X, Check } from 'lucide-react';

interface KnowledgebaseStepProps {
  data: {
    uploadedFiles: File[];
    manualContent: string;
    websiteLinks: string[];
  };
  updateData: (updates: any) => void;
}

export const KnowledgebaseStep: React.FC<KnowledgebaseStepProps> = ({ data, updateData }) => {
  const [newLink, setNewLink] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateData({ uploadedFiles: [...data.uploadedFiles, ...files] });
  };

  const removeFile = (index: number) => {
    const newFiles = data.uploadedFiles.filter((_, i) => i !== index);
    updateData({ uploadedFiles: newFiles });
  };

  const addLink = () => {
    if (newLink.trim()) {
      updateData({ websiteLinks: [...data.websiteLinks, newLink.trim()] });
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    const newLinks = data.websiteLinks.filter((_, i) => i !== index);
    updateData({ websiteLinks: newLinks });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">
          Knowledgebase & Training Data
        </h2>
        <p className="text-muted-foreground">
          Upload content to train your chatbot's knowledge
        </p>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <Label className="text-lg font-medium flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Files (PDF/TXT)
        </Label>
        
        <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.txt"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
          />
          <label htmlFor="fileUpload" className="cursor-pointer">
            <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF and TXT files up to 10MB each
            </p>
          </label>
        </div>

        {/* Uploaded Files List */}
        {data.uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploaded Files:</Label>
            <div className="space-y-2">
              {data.uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Content Section */}
      <div className="space-y-4">
        <Label htmlFor="manualContent" className="text-lg font-medium flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Manual Content
        </Label>
        <Textarea
          id="manualContent"
          placeholder="Paste your content here... (FAQ, product information, policies, etc.)"
          value={data.manualContent}
          onChange={(e) => updateData({ manualContent: e.target.value })}
          rows={6}
          className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Add any text content you want your chatbot to learn from
        </p>
      </div>

      {/* Website Links Section */}
      <div className="space-y-4">
        <Label className="text-lg font-medium flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Website Links
        </Label>
        
        <div className="flex gap-2">
          <Input
            placeholder="https://yourwebsite.com/page"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            className="neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
            onKeyPress={(e) => e.key === 'Enter' && addLink()}
          />
          <Button onClick={addLink} className="neu-button" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Website Links List */}
        {data.websiteLinks.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Added Links:</Label>
            <div className="space-y-2">
              {data.websiteLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate">{link}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Training Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload comprehensive documentation for better responses</li>
              <li>• Include FAQs and common customer questions</li>
              <li>• Add product/service descriptions and policies</li>
              <li>• Website links help the bot understand your business context</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};