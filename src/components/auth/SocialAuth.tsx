
import { Button } from '@/components/ui/button';
import { Github, Mail, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SocialAuth = () => {
  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    toast.success(`Signing in with ${provider}`);
    
    // Simulate successful login and redirect to onboarding
    localStorage.setItem('needyfy-user', JSON.stringify({
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      onboardingStep: 0,
      isAuthenticated: true,
      provider
    }));
    
    navigate('/onboarding');
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin('Github')}
      >
        <Github className="h-5 w-5" />
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin('Google')}
      >
        <Mail className="h-5 w-5" />
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin('LinkedIn')}
      >
        <Linkedin className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SocialAuth;
