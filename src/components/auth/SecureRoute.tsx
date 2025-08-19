
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OptimizedAuthContext';

interface SecureRouteProps {
  children: ReactNode;
}

export const SecureRoute = ({ children }: SecureRouteProps) => {
  const { user, loading } = useAuth();

  console.log('SecureRoute - Auth state:', { user: !!user, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('SecureRoute - Redirecting to login, no user found');
    return <Navigate to="/login" replace />;
  }

  console.log('SecureRoute - User authenticated, rendering children');
  return <>{children}</>;
};
