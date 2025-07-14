import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionTimeout } from '@/components/admin/SessionTimeout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user, session } = useAuth();
  const [activityTimestamp, setActivityTimestamp] = useState(Date.now());
  const [isSecurityCheckActive, setIsSecurityCheckActive] = useState(false);

  // Activity tracking for enhanced session security
  useEffect(() => {
    const trackActivity = () => {
      setActivityTimestamp(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
    };
  }, []);

  // Security monitoring
  useEffect(() => {
    if (!user || !session) return;

    const performSecurityCheck = async () => {
      if (isSecurityCheckActive) return;
      setIsSecurityCheckActive(true);

      try {
        // Check for suspicious activity
        const now = Date.now();
        const inactiveTime = now - activityTimestamp;
        const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

        if (inactiveTime > maxInactiveTime) {
          toast.warning('Extended inactivity detected. Please verify your session.');
          // Force session refresh
          await supabase.auth.refreshSession();
        }

        // Check session validity
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error || !currentSession) {
          toast.error('Session validation failed. Please sign in again.');
          await supabase.auth.signOut();
          return;
        }

        // Rate limit check for suspicious activity
        const requests = localStorage.getItem('security_requests');
        const requestCount = requests ? JSON.parse(requests) : { count: 0, timestamp: now };
        
        if (now - requestCount.timestamp < 60000) { // Within 1 minute
          if (requestCount.count > 10) { // More than 10 requests per minute
            toast.error('Suspicious activity detected. Session terminated for security.');
            await supabase.auth.signOut();
            return;
          }
          requestCount.count++;
        } else {
          requestCount.count = 1;
          requestCount.timestamp = now;
        }
        
        localStorage.setItem('security_requests', JSON.stringify(requestCount));

      } catch (error) {
        console.error('Security check failed:', error);
      } finally {
        setIsSecurityCheckActive(false);
      }
    };

    // Run security checks every 5 minutes
    const securityInterval = setInterval(performSecurityCheck, 5 * 60 * 1000);

    return () => clearInterval(securityInterval);
  }, [user, session, activityTimestamp, isSecurityCheckActive]);

  // Browser security checks
  useEffect(() => {
    // Detect dev tools
    const detectDevTools = () => {
      const threshold = 160;
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (user) {
            console.warn('Developer tools detected - monitoring enhanced');
            // Don't sign out, just warn in console
          }
        }
      }, 500);
    };

    // Prevent context menu in production
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    // Prevent F12, Ctrl+Shift+I, Ctrl+U in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
        }
      }
    };

    detectDevTools();
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user]);

  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
};