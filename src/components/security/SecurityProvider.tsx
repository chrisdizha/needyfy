
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionTimeout } from '@/components/admin/SessionTimeout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user, session } = useAuth();
  const [activityTimestamp, setActivityTimestamp] = useState(Date.now());
  const [isSecurityCheckActive, setIsSecurityCheckActive] = useState(false);
  const { logSecurityEvent, validateSession } = useSecureAuth();

  // Enhanced activity tracking
  useEffect(() => {
    const trackActivity = () => {
      setActivityTimestamp(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
    };
  }, []);

  // Enhanced security monitoring
  useEffect(() => {
    if (!user || !session) return;

    const performSecurityCheck = async () => {
      if (isSecurityCheckActive) return;
      setIsSecurityCheckActive(true);

      try {
        // Check for suspicious activity patterns
        const now = Date.now();
        const inactiveTime = now - activityTimestamp;
        const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

        if (inactiveTime > maxInactiveTime) {
          await logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: now,
            details: 'Extended inactivity detected'
          });
          
          toast.warning('Extended inactivity detected. Please verify your session.');
          
          // Force session refresh
          await supabase.auth.refreshSession();
        }

        // Validate session integrity
        const sessionValid = await validateSession();
        if (!sessionValid) {
          return; // validateSession handles the sign out if needed
        }

        // Enhanced rate limit check for suspicious activity
        const requests = localStorage.getItem('security_requests');
        const requestCount = requests ? JSON.parse(requests) : { count: 0, timestamp: now };
        
        if (now - requestCount.timestamp < 60000) { // Within 1 minute
          if (requestCount.count > 20) { // Increased threshold but more aggressive monitoring
            await logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: now,
              details: `Excessive requests detected: ${requestCount.count} in 1 minute`
            });
            
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

        // Check for multiple tabs/windows (potential session sharing)
        const tabId = sessionStorage.getItem('tab_id') || Math.random().toString(36);
        if (!sessionStorage.getItem('tab_id')) {
          sessionStorage.setItem('tab_id', tabId);
        }
        
        const activeTabs = JSON.parse(localStorage.getItem('active_tabs') || '[]');
        if (!activeTabs.includes(tabId)) {
          const updatedTabs = [...activeTabs, tabId].slice(-5); // Keep max 5 tabs
          localStorage.setItem('active_tabs', JSON.stringify(updatedTabs));
          
          if (updatedTabs.length > 3) {
            await logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: now,
              details: `Multiple tabs detected: ${updatedTabs.length} active`
            });
            
            toast.warning('Multiple browser tabs detected. For security, limit active sessions.');
          }
        }

      } catch (error) {
        console.error('Security check failed:', error);
        
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Security check error: ${error}`
        });
      } finally {
        setIsSecurityCheckActive(false);
      }
    };

    // Run security checks every 3 minutes (more frequent)
    const securityInterval = setInterval(performSecurityCheck, 3 * 60 * 1000);

    // Initial security check
    performSecurityCheck();

    return () => clearInterval(securityInterval);
  }, [user, session, activityTimestamp, isSecurityCheckActive, logSecurityEvent, validateSession]);

  // Enhanced browser security checks
  useEffect(() => {
    // More sophisticated dev tools detection
    const detectDevTools = () => {
      let devtools = { open: false, orientation: null };
      
      setInterval(() => {
        const threshold = 160;
        
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            if (user) {
              console.warn('Developer tools detected - enhanced monitoring active');
              logSecurityEvent({
                type: 'suspicious_activity',
                timestamp: Date.now(),
                details: 'Developer tools opened'
              });
            }
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // Enhanced context menu prevention
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
        if (user) {
          logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: Date.now(),
            details: 'Right-click context menu attempted'
          });
        }
      }
    };

    // Enhanced keyboard shortcut prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        const suspiciousKeys = [
          'F12',
          (e.ctrlKey && e.shiftKey && e.key === 'I'),
          (e.ctrlKey && e.shiftKey && e.key === 'J'),
          (e.ctrlKey && e.key === 'u'),
          (e.ctrlKey && e.key === 'U'),
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ];
        
        if (suspiciousKeys.some(condition => condition === true || condition === e.key)) {
          e.preventDefault();
          if (user) {
            logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: Date.now(),
              details: `Suspicious keyboard shortcut: ${e.key}`
            });
          }
        }
      }
    };

    // Copy/paste monitoring for sensitive areas
    const handleCopy = (e: ClipboardEvent) => {
      if (user && e.target && (e.target as HTMLElement).closest('[data-sensitive]')) {
        logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Copy operation on sensitive data'
        });
      }
    };

    detectDevTools();
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, [user, logSecurityEvent]);

  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
};
