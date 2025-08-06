
import { useState } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, Unlink, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/hooks/useI18n';

const MultiProviderAuth = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);

  const providers = [
    { 
      name: 'Google', 
      id: 'google',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50'
    },
    { 
      name: 'Facebook', 
      id: 'facebook',
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'GitHub', 
      id: 'github',
      color: 'bg-gray-800',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50'
    }
  ];

  const isProviderConnected = (providerId: string) => {
    return user?.app_metadata?.providers?.includes(providerId) || false;
  };

  const handleProviderAuth = async (providerId: string) => {
    setLoading(providerId);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerId as any,
        options: {
          redirectTo: `${window.location.origin}/profile`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
      
      toast.success(`${providerId} authentication initiated`);
    } catch (error) {
      console.error(`Error with ${providerId} auth:`, error);
      toast.error(`Failed to authenticate with ${providerId}`);
    } finally {
      setLoading(null);
    }
  };

  const getProviderStatus = (providerId: string) => {
    const isConnected = isProviderConnected(providerId);
    return {
      connected: isConnected,
      icon: isConnected ? CheckCircle : AlertCircle,
      variant: isConnected ? 'default' as const : 'secondary' as const,
      text: isConnected ? 'Connected' : 'Not Connected'
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          {t('auth.socialAccounts', 'Social Account Connections')}
        </CardTitle>
        <CardDescription>
          {t('auth.socialAccountsDescription', 'Connect your social media accounts for easier sign-in and enhanced security')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const status = getProviderStatus(provider.id);
          const Icon = status.icon;
          
          return (
            <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${status.connected ? 'text-green-600' : 'text-gray-400'}`} />
                    <Badge variant={status.variant}>
                      {status.text}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {status.connected ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connected
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProviderAuth(provider.id)}
                    disabled={loading === provider.id}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {loading === provider.id ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t('auth.socialSecurityNote', 'Connected accounts provide additional security and convenience')}
          </p>
          <p>
            {t('auth.socialDataNote', 'We only access basic profile information to enhance your experience')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiProviderAuth;
