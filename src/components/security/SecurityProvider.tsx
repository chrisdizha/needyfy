import { ReactNode, useEffect, useState } from 'react';
import { RateLimitProvider } from './UniversalRateLimit';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const auth = useAuth();
  
  // Initialize security headers immediately
  useSecurityHeaders();

  // Wait for auth to be initialized before adding auth-dependent security features
  useEffect(() => {
    // Give auth context time to initialize
    const timer = setTimeout(() => {
      setIsAuthReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <RateLimitProvider>
      {/* Only add auth-dependent security features after auth is ready */}
      {isAuthReady && auth ? (
        <AuthDependentSecurityProvider>
          {children}
        </AuthDependentSecurityProvider>
      ) : (
        children
      )}
    </RateLimitProvider>
  );
};

// Separate component for auth-dependent security features
const AuthDependentSecurityProvider = ({ children }: { children: ReactNode }) => {
  return children; // For now, just render children without auth-dependent features
};