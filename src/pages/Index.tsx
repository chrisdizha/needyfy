
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import PublicHome from './PublicHome';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Index component - user:', user, 'loading:', loading);

  useEffect(() => {
    console.log('Index useEffect - user:', user, 'loading:', loading);
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      console.log('Redirecting authenticated user to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show public home for non-authenticated users
  if (!user) {
    console.log('Showing PublicHome for non-authenticated user');
    return <PublicHome />;
  }

  // This shouldn't render due to the useEffect redirect, but just in case
  console.log('Index component fallback - this should not happen');
  return null;
};

export default Index;
