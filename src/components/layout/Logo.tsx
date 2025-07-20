
import { Link } from 'react-router-dom';

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

  return (
    <Link to="/" className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <img 
          src="/lovable-uploads/f8c35258-6e1f-4caf-8eda-778b9f232b46.png"
          alt="Needyfy Logo"
          className={`${sizeClasses[size]} w-auto object-contain`}
        />
      </div>
      {showText && size !== 'sm' && (
        <div className="hidden sm:block">
          <span className={`font-bold ${size === 'lg' ? 'text-2xl' : 'text-xl'} text-primary`}>
            Needyfy
          </span>
          <div className="text-xs text-muted-foreground font-medium -mt-1">Hire Anything, Anywhere!</div>
        </div>
      )}
    </Link>
  );
};

export default Logo;
