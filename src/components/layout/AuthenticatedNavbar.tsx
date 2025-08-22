
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/OptimizedAuthContext";
import { useI18n } from "@/hooks/useI18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LogOut, Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SafeLink } from '@/components/navigation/SafeLink';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import Navbar from './Navbar';

const AuthenticatedNavbar = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { getUserDisplayName, getUserAvatar } = useUserProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { enhancedSignOut, isSigningOut } = useEnhancedAuth();

  // Safety guard: if no user is authenticated, render public navbar instead
  if (!user) {
    return <Navbar />;
  }

  const handleSignOut = async () => {
    await enhancedSignOut();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo size="md" showText={true} />
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <label htmlFor="search-equipment-auth" className="sr-only">
                Search for equipment
              </label>
              <Input 
                id="search-equipment-auth"
                type="text" 
                placeholder="Search for equipment..." 
                className="pr-10 w-full" 
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <SafeLink to="/categories" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Categories
            </SafeLink>
            <SafeLink to="/equipment" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Equipment
            </SafeLink>
            <SafeLink to="/list-equipment" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              List Equipment
            </SafeLink>
            <SafeLink to="/rewards" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Rewards
            </SafeLink>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationCenter />
            <ThemeToggle />
            <LanguageSelector />
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu-auth"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                    <AvatarFallback>{getUserDisplayName().charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">{t('nav.dashboard')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">{t('nav.profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookings">{t('nav.myBookings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      {t('auth.signingOut')}
                    </div>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.signOut')}
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <label htmlFor="search-equipment-mobile-auth" className="sr-only">
              Search for equipment
            </label>
            <Input 
              id="search-equipment-mobile-auth"
              type="text" 
              placeholder="Search for equipment..." 
              className="pr-10 w-full" 
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          id="mobile-menu-auth"
          className={cn(
            "md:hidden absolute left-0 right-0 bg-background shadow-md transition-all duration-300 ease-in-out z-40 border-b",
            isMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0 overflow-hidden"
          )}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <SafeLink to="/categories" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Categories
            </SafeLink>
            <SafeLink to="/equipment" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Equipment
            </SafeLink>
            <SafeLink to="/list-equipment" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              List Equipment
            </SafeLink>
            <SafeLink to="/rewards" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Rewards
            </SafeLink>
            <SafeLink to="/dashboard" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </SafeLink>
            <SafeLink to="/profile" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Profile
            </SafeLink>
            <SafeLink to="/bookings" className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              My Bookings
            </SafeLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
