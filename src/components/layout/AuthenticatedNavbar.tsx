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

const AuthenticatedNavbar = () => {
  const { user, signOut, isAdmin } = useAuth();
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
                
                <rect x="12" y="20" width="20" height="12" rx="2" fill="url(#navGradient)" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="8" y="12" width="8" height="8" rx="1" fill="none" stroke="url(#navGradient)" strokeWidth="1.5"/>
                <circle cx="18" cy="35" r="5" fill="none" stroke="url(#navGradient)" strokeWidth="1.5"/>
                <circle cx="30" cy="35" r="3" fill="none" stroke="url(#navGradient)" strokeWidth="1.5"/>
                <path d="M32 8 L40 8 L42 12 L40 16 L32 16 Z" fill="url(#navGradient)" opacity="0.8"/>
                <text x="36" y="13" fill="white" fontSize="6" textAnchor="middle">%</text>
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

          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/list-equipment">List Equipment</Link>
              </Button>
              <NotificationCenter />
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
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/provider-bookings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Provider Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/categories" className="text-gray-600 hover:text-needyfy-blue font-medium">
                Categories
              </Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-needyfy-blue font-medium">
                How It Works
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
          )}

          <div className="md:hidden flex items-center">
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
                        <Link to="/bookings">My Bookings</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/list-equipment">List Equipment</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/provider-bookings">Provider Dashboard</Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" asChild className="justify-start">
                          <Link to="/admin">Admin Dashboard</Link>
                        </Button>
                      )}
                      <Button variant="ghost" onClick={signOut} className="justify-start text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/categories">Categories</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/how-it-works">How It Works</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/list-equipment">List Equipment</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/login">Log In</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/register">Sign Up</Link>
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
              placeholder="Search for equipment..." 
              className="pr-10 w-full" 
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;