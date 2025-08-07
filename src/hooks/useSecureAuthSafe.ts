import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityEvent {
  type: 'login' | 'suspicious_activity' | 'session_timeout' | 'multiple_sessions';
  timestamp: number;
  details: string;
  deviceFingerprint?: string;
}

export const useSecureAuthSafe = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  const logSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'deviceFingerprint'>) => {
    try {
      // Add to local state
      const eventWithFingerprint = {
        ...event,
        deviceFingerprint: `${navigator.userAgent}_${Date.now()}`
      };
      setSecurityEvents(prev => [...prev.slice(-9), eventWithFingerprint]); // Keep last 10

      // Try to log to database if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: event.type,
          p_event_details: { details: event.details },
          p_risk_level: event.type === 'suspicious_activity' ? 'medium' : 'low'
        });
      }
    } catch (error) {
      console.error('Error logging security event:', error);
      // Still add to local state even if database logging fails
      setSecurityEvents(prev => [...prev.slice(-9), event]);
    }
  }, []);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      
      if (expiresAt <= now) {
        await logSecurityEvent({
          type: 'session_timeout',
          timestamp: now,
          details: 'Session expired during validation'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Session validation failed: ${error}`
      });
      return false;
    }
  }, [logSecurityEvent]);

  const checkConcurrentSessions = useCallback(async () => {
    try {
      const sessionKey = 'app_session_count';
      const currentCount = parseInt(localStorage.getItem(sessionKey) || '0');
      const newCount = currentCount + 1;
      
      localStorage.setItem(sessionKey, newCount.toString());
      setSessionCount(newCount);

      if (newCount > 2) {
        await logSecurityEvent({
          type: 'multiple_sessions',
          timestamp: Date.now(),
          details: `Multiple sessions detected: ${newCount}`
        });
        
        toast.warning('Multiple sessions detected. Please ensure account security.');
      }
    } catch (error) {
      console.error('Error checking concurrent sessions:', error);
    }
  }, [logSecurityEvent]);

  return {
    securityEvents,
    sessionCount,
    logSecurityEvent,
    validateSession,
    checkConcurrentSessions
  };
};