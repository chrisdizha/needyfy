import { ReactNode } from 'react';
import { RateLimitProvider } from './UniversalRateLimit';
import { SecureSessionProvider } from './SecureSessionManager';
import { ConsolidatedSecurityProvider } from './ConsolidatedSecurityProvider';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  // Initialize security headers
  useSecurityHeaders();

  return (
    <ConsolidatedSecurityProvider>
      <RateLimitProvider>
        <SecureSessionProvider>
          {children}
        </SecureSessionProvider>
      </RateLimitProvider>
    </ConsolidatedSecurityProvider>
  );
};