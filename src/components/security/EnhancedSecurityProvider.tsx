
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionTimeout } from '@/components/admin/SessionTimeout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useRateLimit } from '@/hooks/useRateLimit';

interface EnhancedSecurityProviderProps {
  children: ReactNode;
}

export const EnhancedSecurityProvider = ({ children }: EnhancedSecurityProviderProps) => {
  const { user, session } = useAuth();
  const [activityTimestamp, setActivityTimestamp] = useState(Date.now());
  const [suspiciousActivityCount, setSuspiciousActivityCount] = useState(0);
  const { logSecurityEvent, validateSession } = useSecureAuth();
  const { checkRateLimit } = useRateLimit();

  // Enhanced activity tracking with anomaly detection
  useEffect(() => {
    const trackActivity = (event: Event) => {
      setActivityTimestamp(Date.now());
      
      // Track rapid-fire clicks (potential bot activity)
      if (event.type === 'click') {
        const now = Date.now();
        const recentClicks = JSON.parse(localStorage.getItem('click_times') || '[]');
        const filteredClicks = recentClicks.filter((time: number) => now - time < 1000);
        filteredClicks.push(now);
        localStorage.setItem('click_times', JSON.stringify(filteredClicks));
        
        if (filteredClicks.length > 10) {
          logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: now,
            details: 'Rapid click activity detected (possible bot)'
          });
        }
      }
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
  }, [logSecurityEvent]);

  // Enhanced security monitoring with progressive response
  useEffect(() => {
    if (!user || !session) return;

    const performEnhancedSecurityCheck = async () => {
      try {
        const now = Date.now();
        
        // Check for extended inactivity
        const inactiveTime = now - activityTimestamp;
        if (inactiveTime > 20 * 60 * 1000) { // 20 minutes
          await logSecurityEvent({
            type: 'session_timeout',
            timestamp: now,
            details: 'Extended inactivity - auto logout'
          });
          
          toast.error('Session expired due to inactivity');
          await supabase.auth.signOut();
          return;
        }

        // Enhanced session validation
        const sessionValid = await validateSession();
        if (!sessionValid) return;

        // Check for suspicious patterns
        const securityRequests = localStorage.getItem('security_requests');
        const requestData = securityRequests ? JSON.parse(securityRequests) : { count: 0, timestamp: now };
        
        if (now - requestData.timestamp < 60000) {
          if (requestData.count > 50) {
            setSuspiciousActivityCount(prev => prev + 1);
            
            await logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: now,
              details: `High request rate: ${requestData.count} requests in 1 minute`
            });
            
            // Progressive response based on suspicious activity count
            if (suspiciousActivityCount >= 3) {
              toast.error('Multiple security violations detected. Account locked.');
              await supabase.auth.signOut();
              return;
            } else if (suspiciousActivityCount >= 2) {
              toast.warning('Security warning: Unusual activity detected');
            }
          }
          requestData.count++;
        } else {
          requestData.count = 1;
          requestData.timestamp = now;
        }
        
        localStorage.setItem('security_requests', JSON.stringify(requestData));

        // Monitor for tab switching patterns (potential session sharing)
        const tabSwitches = JSON.parse(localStorage.getItem('tab_switches') || '[]');
        const recentSwitches = tabSwitches.filter((time: number) => now - time < 5 * 60 * 1000);
        
        if (document.visibilityState === 'visible' && recentSwitches.length > 0) {
          recentSwitches.push(now);
          localStorage.setItem('tab_switches', JSON.stringify(recentSwitches));
          
          if (recentSwitches.length > 20) {
            await logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: now,
              details: 'Excessive tab switching detected'
            });
          }
        }

      } catch (error) {
        console.error('Enhanced security check failed:', error);
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Security check error: ${error}`
        });
      }
    };

    // More frequent security checks
    const securityInterval = setInterval(performEnhancedSecurityCheck, 2 * 60 * 1000);
    performEnhancedSecurityCheck();

    return () => clearInterval(securityInterval);
  }, [user, session, activityTimestamp, suspiciousActivityCount, logSecurityEvent, validateSession]);

  // Enhanced browser security with content protection
  useEffect(() => {
    // Prevent text selection on sensitive areas
    const preventSelection = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-sensitive]')) {
        e.preventDefault();
        return false;
      }
    };

    // Enhanced keyboard monitoring
    const handleKeyDown = async (e: KeyboardEvent) => {
      const suspiciousKeys = [
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && e.key === 'I',
        e.ctrlKey && e.shiftKey && e.key === 'J',
        e.ctrlKey && e.key === 'u',
        e.ctrlKey && e.key === 'U',
        e.ctrlKey && e.shiftKey && e.key === 'C',
        e.ctrlKey && e.key === 's' // Prevent save
      ];
      
      if (suspiciousKeys.some(Boolean)) {
        e.preventDefault();
        if (user) {
          await logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: Date.now(),
            details: `Suspicious keyboard combination: ${e.key}`
          });
        }
      }
    };

    // Monitor clipboard access
    const handleCopy = async (e: ClipboardEvent) => {
      if (user && e.target && (e.target as HTMLElement).closest('[data-sensitive]')) {
        e.preventDefault();
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Attempted copy from sensitive area'
        });
        toast.warning('Copying from this area is not allowed');
      }
    };

    // Enhanced right-click protection
    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();
      if (user) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Right-click context menu attempted'
        });
      }
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);

    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
    };
  }, [user, logSecurityEvent]);

  // Content Security Policy enforcement
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://js.stripe.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://*.supabase.co https://api.stripe.com;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
};
