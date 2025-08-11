
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDeviceFingerprint } from '@/components/security/SecurityEnhancements';

interface SessionSecurityMetrics {
  sessionAge: number; // in minutes
  timeUntilExpiry: number; // in minutes
  securityScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
}

export const useEnhancedSessionSecurity = () => {
  const { user, session } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState<SessionSecurityMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastSecurityCheck, setLastSecurityCheck] = useState<Date | null>(null);

  const calculateSecurityScore = useCallback((metrics: Omit<SessionSecurityMetrics, 'securityScore' | 'riskLevel'>): { score: number; riskLevel: SessionSecurityMetrics['riskLevel'] } => {
    let score = 100;
    let riskLevel: SessionSecurityMetrics['riskLevel'] = 'low';

    // Deduct points for session age (older sessions are riskier)
    if (metrics.sessionAge > 480) { // 8 hours
      score -= 30;
      riskLevel = 'high';
    } else if (metrics.sessionAge > 240) { // 4 hours
      score -= 15;
      riskLevel = 'medium';
    } else if (metrics.sessionAge > 120) { // 2 hours
      score -= 5;
    }

    // Deduct points for approaching expiry
    if (metrics.timeUntilExpiry < 5) {
      score -= 25;
      riskLevel = 'critical';
    } else if (metrics.timeUntilExpiry < 15) {
      score -= 15;
      if (riskLevel === 'low') riskLevel = 'high';
    } else if (metrics.timeUntilExpiry < 30) {
      score -= 10;
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Deduct points for each threat
    score -= metrics.threats.length * 10;
    if (metrics.threats.length > 2) {
      riskLevel = 'critical';
    } else if (metrics.threats.length > 0 && riskLevel === 'low') {
      riskLevel = 'medium';
    }

    return { score: Math.max(0, score), riskLevel };
  }, []);

  const checkSessionSecurity = useCallback(async (): Promise<SessionSecurityMetrics | null> => {
    if (!session || !user) {
      return null;
    }

    try {
      const now = Date.now();
      const sessionStart = new Date(session.created_at || 0).getTime();
      const sessionExpiry = (session.expires_at || 0) * 1000;
      
      const sessionAge = Math.floor((now - sessionStart) / (1000 * 60)); // minutes
      const timeUntilExpiry = Math.floor((sessionExpiry - now) / (1000 * 60)); // minutes
      
      const threats: string[] = [];

      // Check for potential security threats
      
      // 1. Device fingerprint mismatch
      const currentFingerprint = getDeviceFingerprint();
      const storedFingerprint = localStorage.getItem('device_fingerprint');
      if (storedFingerprint && storedFingerprint !== currentFingerprint) {
        threats.push('Device fingerprint mismatch detected');
      }

      // 2. Multiple active sessions
      const activeSessions = JSON.parse(localStorage.getItem('active_sessions') || '[]');
      if (activeSessions.length > 3) {
        threats.push('Too many concurrent sessions');
      }

      // 3. Suspicious timing patterns
      const lastActivity = localStorage.getItem('last_activity_timestamp');
      if (lastActivity) {
        const timeSinceActivity = now - parseInt(lastActivity);
        if (timeSinceActivity > 30 * 60 * 1000) { // 30 minutes of inactivity
          threats.push('Extended period of inactivity');
        }
      }

      // 4. Check for session hijacking indicators
      const userAgent = navigator.userAgent;
      const storedUserAgent = localStorage.getItem('session_user_agent');
      if (storedUserAgent && storedUserAgent !== userAgent) {
        threats.push('User agent change detected');
      } else if (!storedUserAgent) {
        localStorage.setItem('session_user_agent', userAgent);
      }

      // 5. Time-based anomalies
      const loginHour = new Date(sessionStart).getHours();
      const currentHour = new Date().getHours();
      if (Math.abs(currentHour - loginHour) > 8) {
        threats.push('Unusual time-based activity pattern');
      }

      const baseMetrics = {
        sessionAge,
        timeUntilExpiry,
        threats
      };

      const { score, riskLevel } = calculateSecurityScore(baseMetrics);

      const metrics: SessionSecurityMetrics = {
        ...baseMetrics,
        securityScore: score,
        riskLevel
      };

      // Log security events for high-risk situations
      if (riskLevel === 'high' || riskLevel === 'critical') {
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: 'session_security_risk',
          p_event_details: {
            security_score: score,
            risk_level: riskLevel,
            threats: threats,
            session_age_minutes: sessionAge,
            time_until_expiry_minutes: timeUntilExpiry
          },
          p_risk_level: riskLevel === 'critical' ? 'high' : 'medium'
        });
      }

      setSecurityMetrics(metrics);
      setLastSecurityCheck(new Date());
      
      return metrics;
    } catch (error) {
      console.error('Session security check failed:', error);
      return null;
    }
  }, [session, user, calculateSecurityScore]);

  const handleSecurityThreat = useCallback(async (threat: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    if (!user) return;

    // Log the threat
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: 'security_threat_detected',
      p_event_details: {
        threat_description: threat,
        threat_severity: severity,
        session_id: session?.access_token?.substring(0, 8) || 'unknown',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      p_risk_level: severity === 'critical' ? 'high' : severity
    });

    // Take appropriate action based on severity
    switch (severity) {
      case 'critical':
        toast.error('Critical security threat detected. Please sign in again for your safety.', {
          duration: 10000,
          action: {
            label: 'Sign Out',
            onClick: async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }
          }
        });
        break;
      case 'high':
        toast.warning(`Security alert: ${threat}. Please verify your account security.`, {
          duration: 8000
        });
        break;
      case 'medium':
        toast.info(`Security notice: ${threat}`, {
          duration: 5000
        });
        break;
      case 'low':
        console.log(`Security info: ${threat}`);
        break;
    }
  }, [user, session]);

  const refreshSessionSecurity = useCallback(async () => {
    if (!session) return;

    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        await handleSecurityThreat('Session refresh failed', 'high');
      } else {
        toast.success('Session refreshed successfully');
        await checkSessionSecurity();
      }
    } catch (error) {
      await handleSecurityThreat('Session refresh error', 'high');
    }
  }, [session, handleSecurityThreat, checkSessionSecurity]);

  // Monitor session security continuously
  useEffect(() => {
    if (!user || !session) {
      setIsMonitoring(false);
      setSecurityMetrics(null);
      return;
    }

    setIsMonitoring(true);
    
    // Initial security check
    checkSessionSecurity();

    // Update activity timestamp
    const updateActivity = () => {
      localStorage.setItem('last_activity_timestamp', Date.now().toString());
    };

    // Set up continuous monitoring
    const securityInterval = setInterval(checkSessionSecurity, 2 * 60 * 1000); // Every 2 minutes
    const activityInterval = setInterval(updateActivity, 30 * 1000); // Every 30 seconds

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      clearInterval(securityInterval);
      clearInterval(activityInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      setIsMonitoring(false);
    };
  }, [user, session, checkSessionSecurity]);

  return {
    securityMetrics,
    isMonitoring,
    lastSecurityCheck,
    checkSessionSecurity,
    handleSecurityThreat,
    refreshSessionSecurity
  };
};
