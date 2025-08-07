import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuthSafe } from '@/hooks/useSecureAuthSafe';
import { toast } from 'sonner';

interface SessionContextType {
  isSessionValid: boolean;
  sessionHealth: 'healthy' | 'warning' | 'expired';
  lastValidation: number;
  forceRevalidation: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const useSecureSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSecureSession must be used within SecureSessionProvider');
  }
  return context;
};

interface SecureSessionProviderProps {
  children: ReactNode;
}

export const SecureSessionProvider = ({ children }: SecureSessionProviderProps) => {
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [sessionHealth, setSessionHealth] = useState<'healthy' | 'warning' | 'expired'>('healthy');
  const [lastValidation, setLastValidation] = useState(Date.now());
  const { logSecurityEvent, validateSession } = useSecureAuthSafe();

  const validateCurrentSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setIsSessionValid(false);
        setSessionHealth('expired');
        return false;
      }

      // Check session expiry
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry <= 0) {
        setIsSessionValid(false);
        setSessionHealth('expired');
        
        await logSecurityEvent({
          type: 'session_timeout',
          timestamp: now,
          details: 'Session has expired'
        });
        
        toast.error('Your session has expired. Please log in again.');
        return false;
      }

      // Warning if session expires within 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        setSessionHealth('warning');
        toast.warning('Your session will expire soon. Please save your work.');
      } else {
        setSessionHealth('healthy');
      }

      // Validate session integrity
      const isValid = await validateSession();
      setIsSessionValid(isValid);
      setLastValidation(now);

      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      setIsSessionValid(false);
      setSessionHealth('expired');
      
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Session validation failed: ${error}`
      });
      
      return false;
    }
  };

  const forceRevalidation = async (): Promise<void> => {
    await validateCurrentSession();
  };

  // Validate session on mount and periodically
  useEffect(() => {
    validateCurrentSession();
    
    const interval = setInterval(() => {
      validateCurrentSession();
    }, 2 * 60 * 1000); // Every 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsSessionValid(false);
          setSessionHealth('expired');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await validateCurrentSession();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Monitor for suspicious activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Re-validate session when user returns to tab
        validateCurrentSession();
      }
    };

    const handleBeforeUnload = () => {
      // Clear sensitive data from memory
      setIsSessionValid(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <SessionContext.Provider value={{
      isSessionValid,
      sessionHealth,
      lastValidation,
      forceRevalidation
    }}>
      {children}
    </SessionContext.Provider>
  );
};