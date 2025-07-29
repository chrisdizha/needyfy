
import { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionTimeout } from '@/components/admin/SessionTimeout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface OptimizedSecurityProviderProps {
  children: ReactNode;
}

// Debounced activity tracking
const useActivityTracking = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  const throttledUpdateActivity = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateActivity, 1000); // Throttle to once per second
    };
  }, [updateActivity]);

  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
    };
  }, [throttledUpdateActivity]);

  return lastActivity;
};

// Optimized security monitoring
const useOptimizedSecurityMonitoring = (user: any, session: any, lastActivity: number) => {
  const { logSecurityEvent, validateSession } = useSecureAuth();
  const [securityCheckCount, setSecurityCheckCount] = useState(0);

  const performSecurityCheck = useCallback(async () => {
    if (!user || !session) return;

    try {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      // Only check for extended inactivity every 5th check to reduce overhead
      if (securityCheckCount % 5 === 0 && inactiveTime > 20 * 60 * 1000) {
        await logSecurityEvent({
          type: 'session_timeout',
          timestamp: now,
          details: 'Extended inactivity detected'
        });
        
        toast.error('Session expired due to inactivity');
        await supabase.auth.signOut();
        return;
      }

      // Lightweight session validation every 10th check
      if (securityCheckCount % 10 === 0) {
        const sessionValid = await validateSession();
        if (!sessionValid) return;
      }

      setSecurityCheckCount(prev => (prev + 1) % 20);
    } catch (error) {
      console.error('Security check failed:', error);
    }
  }, [user, session, lastActivity, securityCheckCount, logSecurityEvent, validateSession]);

  useEffect(() => {
    if (!user || !session) return;

    // Less frequent security checks (every 5 minutes instead of 2)
    const securityInterval = setInterval(performSecurityCheck, 5 * 60 * 1000);
    performSecurityCheck();

    return () => clearInterval(securityInterval);
  }, [user, session, performSecurityCheck]);
};

// Optimized browser security
const useBrowserSecurity = (user: any, logSecurityEvent: any) => {
  useEffect(() => {
    if (!user) return;

    // Consolidated keyboard handler with reduced overhead
    const handleKeyDown = (e: KeyboardEvent) => {
      const suspiciousKeys = [
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && e.key === 'I',
        e.ctrlKey && e.shiftKey && e.key === 'J',
        e.ctrlKey && e.key === 'u'
      ];
      
      if (suspiciousKeys.some(Boolean)) {
        e.preventDefault();
        // Throttle security event logging
        if (Math.random() < 0.1) { // Only log 10% of events to reduce overhead
          logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: Date.now(),
            details: `Suspicious keyboard combination: ${e.key}`
          });
        }
      }
    };

    // Simplified context menu handler
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    document.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user, logSecurityEvent]);
};

export const OptimizedSecurityProvider = ({ children }: OptimizedSecurityProviderProps) => {
  const { user, session } = useAuth();
  const lastActivity = useActivityTracking();
  const { logSecurityEvent } = useSecureAuth();

  // Use optimized hooks
  useOptimizedSecurityMonitoring(user, session, lastActivity);
  useBrowserSecurity(user, logSecurityEvent);

  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
};
