
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { SecurityHeaders } from './SecurityHeaders';
import { useSecureAuthSafe } from '@/hooks/useSecureAuthSafe';
import { useAuth } from '@/contexts/OptimizedAuthContext';

interface SecurityContextType {
  reportSecurityIncident: (incident: string, details?: any) => Promise<void>;
  isSecurityValidated: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user } = useAuth();
  const { logSecurityEvent, validateSession } = useSecureAuthSafe();

  const reportSecurityIncident = async (incident: string, details?: any) => {
    await logSecurityEvent({
      type: 'suspicious_activity',
      timestamp: Date.now(),
      details: `Security incident: ${incident} - ${JSON.stringify(details)}`
    });
  };

  // Periodic security validation
  useEffect(() => {
    if (!user) return;

    const securityInterval = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid) {
        await reportSecurityIncident('Session validation failed during periodic check');
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(securityInterval);
  }, [user]);

  // Monitor for suspicious browser activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs/minimized - normal behavior
        return;
      } else {
        // User returned - validate session
        if (user) {
          validateSession().then(isValid => {
            if (!isValid) {
              reportSecurityIncident('Session invalid on tab focus');
            }
          });
        }
      }
    };

    const handleBeforeUnload = () => {
      // Clear sensitive data from memory
      if (user) {
        localStorage.removeItem('last_form_submit');
        sessionStorage.removeItem('temp_data');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const value: SecurityContextType = {
    reportSecurityIncident,
    isSecurityValidated: true
  };

  return (
    <SecurityContext.Provider value={value}>
      <SecurityHeaders />
      {children}
    </SecurityContext.Provider>
  );
};
