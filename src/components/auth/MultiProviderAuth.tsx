
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Github, Mail, Linkedin, Facebook, Twitter, Link as LinkIcon, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/hooks/useI18n';

interface ConnectedProvider {
  provider: string;
  email?: string;
  connected: boolean;
}

const MultiProviderAuth = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([
    { provider: 'google', connected: false },
    { provider: 'github', connected: false },
    { provider: 'facebook', connected: false },
    { provider: 'twitter', connected: false },
    { provider: 'linkedin_oidc', connected: false },
  ]);

  const providerConfig = {
    google: { 
      name: 'Google', 
      icon: Mail, 
      color: 'text-red-600 border-red-200 hover:bg-red-50' 
    },
    github: { 
      name: 'GitHub', 
      icon: Github, 
      color: 'text-gray-800 border-gray-200 hover:bg-gray-50' 
    },
    facebook: { 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'text-blue-600 border-blue-200 hover:bg-blue-50' 
    },
    twitter: { 
      name: 'Twitter', 
      icon: Twitter, 
      color: 'text-sky-600 border-sky-200 hover:bg-sky-50' 
    },
    linkedin_oidc: { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: 'text-blue-700 border-blue-200 hover:bg-blue-50' 
    },
  };

  const handleProviderConnection = async (provider: string, isConnecting: boolean) => {
    setLoading(provider);
    
    try {
      if (isConnecting) {
        // Link additional provider
        const { error } = await supabase.auth.linkIdentity({
          provider: provider as any,
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          console.error(`Failed to link ${provider}:`, error);
          toast.error(`Failed to connect ${providerConfig[provider as keyof typeof providerConfig].name}: ${error.message}`);
        } else {
          toast.success(`${providerConfig[provider as keyof typeof providerConfig].name} connected successfully!`);
        }
      } else {
        // Unlink provider
        const { error } = await supabase.auth.unlinkIdentity({
          provider: provider as any,
        });

        if (error) {
          console.error(`Failed to unlink ${provider}:`, error);
          toast.error(`Failed to disconnect ${providerConfig[provider as keyof typeof providerConfig].name}: ${error.message}`);
        } else {
          toast.success(`${providerConfig[provider as keyof typeof providerConfig].name} disconnected successfully!`);
          // Update local state
          setConnectedProviders(prev => 
            prev.map(p => p.provider === provider ? { ...p, connected: false } : p)
          );
        }
      }
    } catch (error) {
      console.error(`Provider ${isConnecting ? 'connection' : 'disconnection'} error:`, error);
      toast.error(`An unexpected error occurred`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          {t('profile.connectedAccounts')}
        </CardTitle>
        <CardDescription>
          {t('profile.connectedAccountsDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedProviders.map((provider) => {
          const config = providerConfig[provider.provider as keyof typeof providerConfig];
          const IconComponent = config.icon;
          const isConnected = provider.connected;
          const isLoading = loading === provider.provider;

          return (
            <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 border rounded-lg ${config.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{config.name}</p>
                  {provider.email && (
                    <p className="text-sm text-muted-foreground">{provider.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    {t('common.connected')}
                  </Badge>
                )}
                
                <Button
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleProviderConnection(provider.provider, !isConnected)}
                  disabled={isLoading}
                  className={isConnected ? "text-red-600 hover:text-red-700" : ""}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isConnected ? (
                    <>
                      <Unlink className="h-4 w-4 mr-1" />
                      {t('common.disconnect')}
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {t('common.connect')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}

        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">{t('profile.accountLinkingNote')}</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{t('profile.linkingBenefit1')}</li>
            <li>{t('profile.linkingBenefit2')}</li>
            <li>{t('profile.linkingBenefit3')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiProviderAuth;
