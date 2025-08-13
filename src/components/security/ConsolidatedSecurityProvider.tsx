import React, { ReactNode, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { SessionTimeout } from '@/components/admin/SessionTimeout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface ConsolidatedSecurityProviderProps {
  children: ReactNode;
}

// Heavily optimized activity tracking with extreme throttling
const useOptimizedActivityTracking = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const throttleRef = useRef<boolean>(false);
  const lastUpdateRef = useRef(Date.now());

  const updateActivity = useCallback(() => {
    const now = Date.now();
    // Only update if more than 5 seconds have passed
    if (now - lastUpdateRef.current < 5000 || throttleRef.current) return;
    
    throttleRef.current = true;
    lastUpdateRef.current = now;
    
    setTimeout(() => {
      setLastActivity(now);
      throttleRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'keypress'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  return lastActivity;
};

// Heavily reduced security monitoring
const useConsolidatedSecurityMonitoring = (user: any, session: any, lastActivity: number) => {
  const { logSecurityEvent, validateSession } = useSecureAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastCheckRef = useRef(0);

  const performSecurityCheck = useCallback(async () => {
    const now = Date.now();
    // Only run if 15 minutes have passed since last check
    if (now - lastCheckRef.current < 15 * 60 * 1000) return;
    
    if (!user || !session) return;

    try {
      lastCheckRef.current = now;
      const inactiveTime = now - lastActivity;
      
      // Only check for extreme inactivity (30+ minutes)
      if (inactiveTime > 30 * 60 * 1000) {
        await logSecurityEvent({
          type: 'session_timeout',
          timestamp: now,
          details: 'Extended inactivity - auto logout'
        });
        
        toast.error('Session expired due to inactivity');
        await supabase.auth.signOut();
        return;
      }
    } catch (error) {
      console.error('Security check failed:', error);
    }
  }, [user, session, lastActivity, logSecurityEvent, validateSession]);

  useEffect(() => {
    if (!user || !session) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Very infrequent security checks (every 20 minutes)
    intervalRef.current = setInterval(performSecurityCheck, 20 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, session, performSecurityCheck]);
};

// Minimal browser security
const useOptimizedBrowserSecurity = (user: any, logSecurityEvent: any) => {
  const lastLogRef = useRef(0);

  useEffect(() => {
    if (!user || import.meta.env.DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const suspiciousKeys = [
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && e.key === 'I',
        e.ctrlKey && e.shiftKey && e.key === 'J',
        e.ctrlKey && e.key === 'u'
      ];
      
      if (suspiciousKeys.some(Boolean)) {
        e.preventDefault();
        
        // Log only once every 60 seconds
        const now = Date.now();
        if (now - lastLogRef.current > 60000) {
          lastLogRef.current = now;
          logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: now,
            details: `Dev tools access attempt`
          });
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    document.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user, logSecurityEvent]);
};

export const ConsolidatedSecurityProvider = React.memo(({ children }: ConsolidatedSecurityProviderProps) => {
  const { user, session } = useAuth();
  const lastActivity = useOptimizedActivityTracking();
  const { logSecurityEvent } = useSecureAuth();
  
  // Performance monitoring (internally no-ops in production)
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
});

ConsolidatedSecurityProvider.displayName = 'ConsolidatedSecurityProvider';
