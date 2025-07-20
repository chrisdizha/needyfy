
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderBackButtonProps {
  to?: string;
  label?: string;
}

const ProviderBackButton = ({ 
  to = '/provider-resources', 
  label = 'Back to Provider Resources' 
}: ProviderBackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(to)}
      className="mb-6 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
};

export default ProviderBackButton;
