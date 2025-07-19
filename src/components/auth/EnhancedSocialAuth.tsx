
import { Button } from '@/components/ui/button';
import { Github, Mail, Linkedin, Facebook, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/hooks/useI18n';

interface SocialProvider {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  provider: 'google' | 'github' | 'facebook' | 'twitter' | 'linkedin_oidc';
  color: string;
}

const socialProviders: SocialProvider[] = [
  {
    name: 'Google',
    icon: Mail,
    provider: 'google',
    color: 'hover:bg-red-50 hover:border-red-200',
  },
  {
    name: 'GitHub',
    icon: Github,
    provider: 'github',
    color: 'hover:bg-gray-50 hover:border-gray-200',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    provider: 'facebook',
    color: 'hover:bg-blue-50 hover:border-blue-200',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    provider: 'linkedin_oidc',
    color: 'hover:bg-blue-50 hover:border-blue-200',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    provider: 'twitter',
    color: 'hover:bg-sky-50 hover:border-sky-200',
  },
];

const EnhancedSocialAuth = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error(`${provider.name} login error:`, error);
        toast.error(`Failed to sign in with ${provider.name}: ${error.message}`);
      } else {
        toast.success(`Signing in with ${provider.name}...`);
      }
    } catch (error) {
      console.error(`Unexpected ${provider.name} login error:`, error);
      toast.error(`An unexpected error occurred signing in with ${provider.name}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {socialProviders.slice(0, 4).map((provider) => {
          const IconComponent = provider.icon;
          return (
            <Button
              key={provider.name}
              variant="outline"
              className={`w-full transition-colors ${provider.color}`}
              onClick={() => handleSocialLogin(provider)}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{provider.name}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Twitter as a single button below */}
      <Button
        variant="outline"
        className={`w-full transition-colors ${socialProviders[4].color}`}
        onClick={() => handleSocialLogin(socialProviders[4])}
      >
        <Twitter className="h-4 w-4 mr-2" />
        {socialProviders[4].name}
      </Button>
    </div>
  );
};

export default EnhancedSocialAuth;
