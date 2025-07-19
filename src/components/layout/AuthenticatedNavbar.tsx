
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationCenter } from "./NotificationCenter";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useI18n } from '@/hooks/useI18n';

const AuthenticatedNavbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder={t('hero.searchPlaceholder')}
                className="pr-10 w-full" 
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          {user ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/list-equipment">{t('nav.listEquipment')}</Link>
              </Button>
              <NotificationCenter />
              <ThemeToggle />
              <LanguageSelector />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/bookings" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.myBookings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/provider-bookings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.providerDashboard')}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          {t('nav.adminDashboard')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/categories" className="text-muted-foreground hover:text-primary font-medium">
                {t('common.categories')}
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-primary font-medium">
                {t('nav.howItWorks')}
              </Link>
              <Link to="/list-equipment" className="text-muted-foreground hover:text-primary font-medium">
                {t('nav.listEquipment')}
              </Link>
              <ThemeToggle />
              <LanguageSelector />
              <Link to="/login">
                <Button variant="outline" size="sm" className="mr-2">
                  {t('common.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t('common.register')}</Button>
              </Link>
            </div>
          )}

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSelector />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-4">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 p-4 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/bookings">{t('nav.myBookings')}</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/list-equipment">{t('nav.listEquipment')}</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/provider-bookings">{t('nav.providerDashboard')}</Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" asChild className="justify-start">
                          <Link to="/admin">{t('nav.adminDashboard')}</Link>
                        </Button>
                      )}
                      <Button variant="ghost" onClick={signOut} className="justify-start text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('common.signOut')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/categories">{t('common.categories')}</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/how-it-works">{t('nav.howItWorks')}</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/list-equipment">{t('nav.listEquipment')}</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/login">{t('common.login')}</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/register">{t('common.register')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative">
            <Input 
              type="text" 
              placeholder={t('hero.searchPlaceholder')}
              className="pr-10 w-full" 
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
