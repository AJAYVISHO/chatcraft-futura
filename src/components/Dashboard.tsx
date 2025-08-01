import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  Code, 
  MoreVertical,
  Settings,
  Users,
  MessageCircle,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useChatbots } from '@/hooks/useChatbots';

interface DashboardProps {
  onCreateNew: () => void;
  onEditChatbot?: (chatbotId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onEditChatbot }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { signOut } = useAuth();
  const { chatbots, loading, deleteChatbot } = useChatbots();

  const filteredChatbots = chatbots.filter(bot =>
    bot.chatbotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (chatbotId: string) => {
    if (window.confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      await deleteChatbot(chatbotId);
    }
  };

  const handleEdit = (chatbotId: string) => {
    if (onEditChatbot) {
      onEditChatbot(chatbotId);
    }
  };

  const getStatusColor = (createdAt: string) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated < 7) return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (daysSinceCreated < 30) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    return 'bg-red-500/10 text-red-700 border-red-500/20';
  };

  const getStatus = (createdAt: string) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated < 7) return 'active';
    if (daysSinceCreated < 30) return 'inactive';
    return 'draft';
  };

  const totalMessages = chatbots.length * 100; // Mock data for now
  const totalUsers = chatbots.length * 25; // Mock data for now
  const activeBots = chatbots.filter(bot => getStatus(bot.created_at || '') === 'active').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk text-foreground">
            Chatbot Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your AI chatbots
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={signOut} className="neu-button">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button onClick={onCreateNew} className="gradient-button">
            <Plus className="w-4 h-4 mr-2" />
            Create New Chatbot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Chatbots</p>
              <p className="text-2xl font-bold text-foreground">{chatbots.length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Bots</p>
              <p className="text-2xl font-bold text-foreground">{activeBots}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold text-foreground">{totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search chatbots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 neu-button border-0 bg-card/50 backdrop-blur-sm focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </Card>

      {/* Chatbots List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <Bot className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading chatbots...</p>
          </div>
        ) : (
          filteredChatbots.map((chatbot) => (
            <Card key={chatbot.id} className="glass-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {typeof chatbot.avatar === 'string' && chatbot.avatar.startsWith('data:') ? (
                      <img src={chatbot.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      chatbot.avatar
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{chatbot.chatbotName}</h3>
                    <p className="text-sm text-muted-foreground">{chatbot.businessName}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="neu-button">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card border-border/50" align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => handleEdit(chatbot.id!)}>
                      <Edit className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Copy className="w-4 h-4" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Code className="w-4 h-4" />
                      Embed Code
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-destructive" 
                      onClick={() => handleDelete(chatbot.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Industry</span>
                <Badge variant="outline" className="text-xs">
                  {chatbot.industry}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={`text-xs capitalize ${getStatusColor(chatbot.created_at || '')}`}>
                  {getStatus(chatbot.created_at || '')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{Math.floor(Math.random() * 500) + 50}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{Math.floor(Math.random() * 100) + 10}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>

              <div className="pt-3">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(chatbot.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
          ))
        )}
      </div>
      {filteredChatbots.length === 0 && !loading && (
        <Card className="glass-card p-12 text-center">
          <div className="p-4 bg-muted/20 rounded-full inline-block mb-4">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No chatbots found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first chatbot to get started'}
          </p>
          <Button onClick={onCreateNew} className="gradient-button">
            <Plus className="w-4 h-4 mr-2" />
            Create New Chatbot
          </Button>
        </Card>
      )}
    </div>
  );
};