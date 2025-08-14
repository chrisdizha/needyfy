
import { SafeLink } from '@/components/navigation/SafeLink';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = "", showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <SafeLink to="/" className={`flex items-center space-x-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <img 
          src="/lovable-uploads/f8c35258-6e1f-4caf-8eda-778b9f232b46.png"
          alt="Needyfy Logo"
          className={`${sizeClasses[size]} w-auto object-contain`}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            // Fallback to text-only logo if image fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      {showText && (
        <div className="hidden sm:block">
          <span className={`font-bold ${textSizeClasses[size]} text-primary`}>
            Needyfy
          </span>
          <div className="text-xs text-muted-foreground font-medium -mt-1">Equipment Rental</div>
        </div>
      )}
    </SafeLink>
  );
};

export default Logo;
