
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import PublicHome from './PublicHome';

const Index = () => {
  console.log('🏠 Index component rendering...');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Auth state in Index:', { user: !!user, loading });

  useEffect(() => {
    console.log('Index useEffect triggered:', { user: !!user, loading });
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      console.log('Redirecting authenticated user to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('Showing loading state in Index');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show public home for non-authenticated users
  if (!user) {
    console.log('Rendering PublicHome for non-authenticated user');
    return <PublicHome />;
  }

  console.log('Index component fallback return null');
  // This shouldn't render due to the useEffect redirect, but just in case
  return null;
};

export default Index;
