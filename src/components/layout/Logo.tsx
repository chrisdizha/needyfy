
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = "", showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link to="/" className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <svg 
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48} 
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48} 
          viewBox="0 0 48 48" 
          className="text-primary"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
          
          {/* Main equipment shape */}
          <rect x="12" y="20" width="20" height="12" rx="2" fill="url(#logoGradient)" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Cabin */}
          <rect x="8" y="12" width="8" height="8" rx="1" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5"/>
          
          {/* Wheels */}
          <circle cx="18" cy="35" r="5" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5"/>
          <circle cx="30" cy="35" r="3" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5"/>
          
          {/* Price tag */}
          <path d="M32 8 L40 8 L42 12 L40 16 L32 16 Z" fill="url(#logoGradient)" opacity="0.8"/>
          <text x="36" y="13" fill="white" fontSize="6" textAnchor="middle">%</text>
          
          {/* Connection line */}
          <line x1="32" y1="12" x2="28" y2="16" stroke="url(#logoGradient)" strokeWidth="1"/>
        </svg>
      </div>
      {showText && (
        <div className="hidden sm:block">
          <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Needyfy
          </span>
          <div className="text-xs text-muted-foreground font-medium -mt-1">Equipment Rental</div>
        </div>
      )}
    </Link>
  );
};

export default Logo;
