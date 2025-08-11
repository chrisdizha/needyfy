
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
          <div className="animate-pulse flex items-center space-x-4">
            <div className="h-8 w-32 bg-muted rounded"></div>
            <div className="ml-auto flex space-x-2">
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
