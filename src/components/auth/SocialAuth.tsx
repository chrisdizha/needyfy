
import { Button } from '@/components/ui/button';
import { Google, Facebook, Apple } from 'lucide-react';

const SocialAuth = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button variant="outline" className="w-full">
        <Google className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="w-full">
        <Facebook className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="w-full">
        <Apple className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SocialAuth;
