import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  label?: string;
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ label = 'Verified', className }) => {
  return (
    <Badge className={className}>
      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {label}
    </Badge>
  );
};

export default VerifiedBadge;
