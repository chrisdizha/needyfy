import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDeviceFingerprint } from '@/components/security/SecurityEnhancements';

interface SecurityEvent {
  type: 'login' | 'suspicious_activity' | 'session_timeout' | 'multiple_sessions';
  timestamp: number;
  details: string;
  deviceFingerprint: string;
}

export const useSecureAuth = () => {
  const { user, session } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  
  // Log security events
  const logSecurityEvent = async (event: Omit<SecurityEvent, 'deviceFingerprint'>) => {
    const deviceFingerprint = getDeviceFingerprint();
    const securityEvent: SecurityEvent = {
      ...event,
      deviceFingerprint
    };
    
    setSecurityEvents(prev => [...prev, securityEvent]);
    
    // Store in localStorage for persistence
    const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    localStorage.setItem('security_events', JSON.stringify([...existingEvents, securityEvent]));
    
    // Send to audit log if user is authenticated
    if (user) {
      try {
        // Convert to a plain object that matches Json type requirements
        const auditData: Record<string, string | number> = {
          type: securityEvent.type,
          timestamp: securityEvent.timestamp,
          details: securityEvent.details,
          deviceFingerprint: securityEvent.deviceFingerprint
        };
        
        await supabase.rpc('log_admin_action', {
          p_action: 'security_event',
          p_table_name: 'security_monitoring',
          p_record_id: user.id,
          p_new_values: auditData
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    }
  };
  
  // Validate session integrity
  const validateSession = async () => {
    if (!session || !user) return true;
    
    try {
      // Check if session is still valid
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        await logSecurityEvent({
          type: 'session_timeout',
          timestamp: Date.now(),
          details: 'Session validation failed'
        });
        
        toast.error('Session expired. Please sign in again.');
        await supabase.auth.signOut();
        return false;
      }
      
      // Check for device fingerprint changes (potential session hijacking)
      const currentFingerprint = getDeviceFingerprint();
      const storedFingerprint = localStorage.getItem('device_fingerprint');
      
      if (storedFingerprint && storedFingerprint !== currentFingerprint) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Device fingerprint mismatch detected'
        });
        
        toast.warning('Unusual device activity detected. Please verify your identity.');
        // Don't automatically sign out, but flag for review
      } else if (!storedFingerprint) {
        localStorage.setItem('device_fingerprint', currentFingerprint);
      }
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };
  
  // Monitor concurrent sessions
  const checkConcurrentSessions = async () => {
    if (!user) return;
    
    try {
      // This would need to be implemented with a sessions table in the database
      // For now, we'll use localStorage to track session count
      const sessionId = session?.access_token?.substring(0, 10) || '';
      const activeSessions = JSON.parse(localStorage.getItem('active_sessions') || '[]');
      
      if (!activeSessions.includes(sessionId)) {
        const updatedSessions = [...activeSessions, sessionId].slice(-3); // Keep max 3 sessions
        localStorage.setItem('active_sessions', JSON.stringify(updatedSessions));
        setSessionCount(updatedSessions.length);
        
        if (updatedSessions.length > 2) {
          await logSecurityEvent({
            type: 'multiple_sessions',
            timestamp: Date.now(),
            details: `${updatedSessions.length} concurrent sessions detected`
          });
          
          toast.warning('Multiple active sessions detected. For security, consider signing out of unused sessions.');
        }
      }
    } catch (error) {
      console.error('Concurrent session check failed:', error);
    }
  };
  
  // Automatic security checks
  useEffect(() => {
    if (!user) return;
    
    const securityInterval = setInterval(async () => {
      await validateSession();
      await checkConcurrentSessions();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Initial checks
    validateSession();
    checkConcurrentSessions();
    
    return () => clearInterval(securityInterval);
  }, [user, session]);
  
  // Clean up security events on sign out
  useEffect(() => {
    if (!user) {
      setSecurityEvents([]);
      localStorage.removeItem('device_fingerprint');
      localStorage.removeItem('active_sessions');
      setSessionCount(0);
    }
  }, [user]);
  
  return {
    securityEvents,
    sessionCount,
    logSecurityEvent,
    validateSession
  };
};
