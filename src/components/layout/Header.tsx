
import { useAuth } from '@/contexts/OptimizedAuthContext';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import Navbar from './Navbar';

const Header = () => {
  const { user, loading } = useAuth();

  // Show a loading skeleton to prevent header flicker
  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl h-16 flex items-center py-4">
          <div className="animate-pulse flex items-center justify-between w-full">
            <div className="h-8 w-32 bg-muted rounded"></div>
            <div className="hidden md:flex space-x-6">
              <div className="h-6 w-20 bg-muted rounded"></div>
              <div className="h-6 w-24 bg-muted rounded"></div>
              <div className="h-6 w-16 bg-muted rounded"></div>
              <div className="h-6 w-12 bg-muted rounded"></div>
              <div className="h-6 w-20 bg-muted rounded"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 w-16 bg-muted rounded"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Render the appropriate navbar based on authentication state
  return user ? <AuthenticatedNavbar /> : <Navbar />;
};

export default Header;
