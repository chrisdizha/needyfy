
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/main";
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
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import Logo from './Logo';

const AuthenticatedNavbar = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { getUserDisplayName, getUserAvatar } = useUserProfile();
  
  const { enhancedSignOut, isSigningOut } = useEnhancedAuth();

  const handleSignOut = async () => {
    await enhancedSignOut();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl h-16 flex items-center py-4">
        <Logo size="md" showText={true} />
        
        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          <NotificationCenter />
          <ThemeToggle />
          <LanguageSelector />
          
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
    </nav>
  );
};

export default AuthenticatedNavbar;
