
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 48 48" className="text-needyfy-blue">
                <defs>
                  <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                
                {/* Tractor base */}
                <rect x="12" y="20" width="20" height="12" rx="2" fill="url(#navGradient)" stroke="currentColor" strokeWidth="1.5"/>
                
                {/* Cabin */}
                <rect x="8" y="12" width="8" height="8" rx="1" fill="none" stroke="url(#navGradient)" strokeWidth="1.5"/>
                
                {/* Wheels */}
                <circle cx="18" cy="35" r="5" fill="none" stroke="url(#navGradient)" strokeWidth="1.5"/>
                <circle cx="30" cy="35" r="3" fill="none" stroke="url(#navGradient)" strokeWidth="1.5"/>
                
                {/* Price tag */}
                <path d="M32 8 L40 8 L42 12 L40 16 L32 16 Z" fill="url(#navGradient)" opacity="0.8"/>
                <text x="36" y="13" fill="white" fontSize="6" textAnchor="middle">%</text>
                
                {/* Connection line */}
                <line x1="32" y1="12" x2="28" y2="16" stroke="url(#navGradient)" strokeWidth="1"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Needyfy
              </span>
              <div className="text-xs text-gray-500 font-medium -mt-1">Equipment Rental</div>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder="Search for equipment..." 
                className="pr-10 w-full" 
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/categories" className="text-gray-600 hover:text-needyfy-blue font-medium">
              Categories
            </Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-needyfy-blue font-medium">
              How It Works
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-needyfy-blue font-medium">
              Pricing
            </Link>
            <Link to="/list-equipment" className="text-gray-600 hover:text-needyfy-blue font-medium">
              List Equipment
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="mr-2">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search for equipment..." 
              className="pr-10 w-full" 
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        <div className={cn(
          "md:hidden absolute left-0 right-0 bg-white shadow-md transition-all duration-300 ease-in-out z-40",
          isMenuOpen ? "max-h-64 py-4" : "max-h-0 py-0 overflow-hidden"
        )}>
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link to="/categories" className="text-gray-600 hover:text-needyfy-blue font-medium py-2">
              Categories
            </Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-needyfy-blue font-medium py-2">
              How It Works
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-needyfy-blue font-medium py-2">
              Pricing
            </Link>
            <Link to="/list-equipment" className="text-gray-600 hover:text-needyfy-blue font-medium py-2">
              List Equipment
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
