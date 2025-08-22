
import { useState } from 'react';
import { SafeLink } from '@/components/navigation/SafeLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background shadow-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <label htmlFor="search-equipment" className="sr-only">
                Search for equipment
              </label>
              <Input 
                id="search-equipment"
                type="text" 
                placeholder="Search for equipment..." 
                className="pr-10 w-full" 
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <SafeLink to="/categories" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Categories
            </SafeLink>
            <SafeLink to="/how-it-works" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              How It Works
            </SafeLink>
            <SafeLink to="/pricing" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Pricing
            </SafeLink>
            <SafeLink to="/blog" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Blog
            </SafeLink>
            <SafeLink to="/rewards" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Rewards
            </SafeLink>
            <SafeLink to="/list-equipment" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              List Equipment
            </SafeLink>
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <div className="flex items-center space-x-2">
              <SafeLink to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </SafeLink>
              <SafeLink to="/register">
                <Button size="sm">Sign Up</Button>
              </SafeLink>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
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
            <label htmlFor="search-equipment-mobile" className="sr-only">
              Search for equipment
            </label>
            <Input 
              id="search-equipment-mobile"
              type="text" 
              placeholder="Search for equipment..." 
              className="pr-10 w-full" 
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div 
          id="mobile-menu"
          className={cn(
            "md:hidden absolute left-0 right-0 bg-background shadow-md transition-all duration-300 ease-in-out z-40 border-b",
            isMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0 overflow-hidden"
          )}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <SafeLink to="/categories" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Categories
            </SafeLink>
            <SafeLink to="/how-it-works" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              How It Works
            </SafeLink>
            <SafeLink to="/pricing" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </SafeLink>
            <SafeLink to="/blog" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Blog
            </SafeLink>
            <SafeLink to="/rewards" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Rewards
            </SafeLink>
            <SafeLink to="/list-equipment" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              List Equipment
            </SafeLink>
            <div className="flex items-center space-x-2 py-2">
              <LanguageSelector />
            </div>
            <div className="flex flex-col space-y-2 pt-2">
              <SafeLink to="/login">
                <Button variant="outline" className="w-full">Log In</Button>
              </SafeLink>
              <SafeLink to="/register">
                <Button className="w-full">Sign Up</Button>
              </SafeLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
