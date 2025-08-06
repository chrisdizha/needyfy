import { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionTimeout } from '@/components/admin/SessionTimeout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface ConsolidatedSecurityProviderProps {
  children: ReactNode;
}

// Optimized activity tracking with better debouncing
const useOptimizedActivityTracking = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // More efficient throttling
  const throttledUpdateActivity = useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    let lastCall = 0;
    
    return () => {
      const now = Date.now();
      if (now - lastCall >= 2000) { // Only update every 2 seconds max
        lastCall = now;
        setLastActivity(now);
      } else {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          setLastActivity(Date.now());
          lastCall = Date.now();
        }, 2000);
      }
    };
  }, []);

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

// Consolidated security monitoring
const useConsolidatedSecurityMonitoring = (user: any, session: any, lastActivity: number) => {
  const { logSecurityEvent, validateSession } = useSecureAuth();
  const [checkCount, setCheckCount] = useState(0);

  const performSecurityCheck = useCallback(async () => {
    if (!user || !session) return;

    try {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      // Progressive security checks to reduce overhead
      if (checkCount % 3 === 0) {
        // Check inactivity every 3rd check
        if (inactiveTime > 25 * 60 * 1000) { // 25 minutes
          await logSecurityEvent({
            type: 'session_timeout',
            timestamp: now,
            details: 'Extended inactivity - auto logout'
          });
          
          toast.error('Session expired due to inactivity');
          await supabase.auth.signOut();
          return;
        }
      }

      if (checkCount % 6 === 0) {
        // Validate session every 6th check
        const sessionValid = await validateSession();
        if (!sessionValid) return;
      }

      setCheckCount(prev => (prev + 1) % 18);
    } catch (error) {
      console.error('Security check failed:', error);
    }
  }, [user, session, lastActivity, checkCount, logSecurityEvent, validateSession]);

  useEffect(() => {
    if (!user || !session) return;

    // Reduced frequency security checks (every 8 minutes)
    const securityInterval = setInterval(performSecurityCheck, 8 * 60 * 1000);
    performSecurityCheck();

    return () => clearInterval(securityInterval);
  }, [user, session, performSecurityCheck]);
};

// Optimized browser security with minimal overhead
const useOptimizedBrowserSecurity = (user: any, logSecurityEvent: any) => {
  const [logThrottle, setLogThrottle] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Consolidated and optimized event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        const suspiciousKeys = [
          e.key === 'F12',
          e.ctrlKey && e.shiftKey && e.key === 'I',
          e.ctrlKey && e.shiftKey && e.key === 'J',
          e.ctrlKey && e.key === 'u'
        ];
        
        if (suspiciousKeys.some(Boolean)) {
          e.preventDefault();
          
          // Heavy throttling of security logs to reduce overhead
          const now = Date.now();
          if (now - logThrottle > 30000) { // Only log once every 30 seconds
            setLogThrottle(now);
            logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: now,
              details: `Suspicious keyboard: ${e.key}`
            });
          }
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    // Use passive listeners where possible
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user, logSecurityEvent, logThrottle]);
};

export const ConsolidatedSecurityProvider = ({ children }: ConsolidatedSecurityProviderProps) => {
  const { user, session } = useAuth();
  const lastActivity = useOptimizedActivityTracking();
  const { logSecurityEvent } = useSecureAuth();
  
  // Performance monitoring
  usePerformanceMonitor('ConsolidatedSecurityProvider');

  // Use consolidated hooks
  useConsolidatedSecurityMonitoring(user, session, lastActivity);
  useOptimizedBrowserSecurity(user, logSecurityEvent);

  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
};