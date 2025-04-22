
import { Button } from '@/components/ui/button';
import { Github, Mail, Linkedin } from 'lucide-react';

const SocialAuth = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button variant="outline" className="w-full">
        <Github className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="w-full">
        <Mail className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="w-full">
        <Linkedin className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SocialAuth;
