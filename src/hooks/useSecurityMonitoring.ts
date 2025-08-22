
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  handled: boolean;
}

interface SecurityStats {
  totalEvents: number;
  averageRiskScore: number;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<SecurityStats>({ totalEvents: 0, averageRiskScore: 0 });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const logSecurityEvent = useCallback(async (eventType: string, details: string, riskLevel: 'low' | 'medium' | 'high' = 'low') => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_details: { details, timestamp: Date.now() },
        p_risk_level: riskLevel
      });

      // Add alert if risk level is medium or higher
      if (riskLevel === 'medium' || riskLevel === 'high') {
        const newAlert: SecurityAlert = {
          id: Math.random().toString(36).substr(2, 9),
          type: eventType,
          severity: riskLevel,
          message: details,
          timestamp: new Date(),
          handled: false
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  const handleAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, handled: true } : alert
    ));
  }, []);

  // Monitor for suspicious activity patterns
  useEffect(() => {
    if (!user) return;

    setIsMonitoring(true);

    // Check for multiple tabs/windows
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('session_backgrounded', 'User tab went to background');
      } else {
        logSecurityEvent('session_foregrounded', 'User tab came to foreground');
      }
    };

    // Monitor failed requests that could indicate attacks
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 400) {
          logSecurityEvent('failed_request', `Request failed: ${response.status} ${args[0]}`, 'medium');
        }
        return response;
      } catch (error) {
        logSecurityEvent('network_error', `Network error: ${error}`, 'medium');
        throw error;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.fetch = originalFetch;
      setIsMonitoring(false);
    };
  }, [user, logSecurityEvent]);

  // Session timeout warning
  useEffect(() => {
    if (!user) return;

    const checkSessionExpiry = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          const timeLeft = expiresAt - now;
          
          // Warn 5 minutes before expiry
          if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
            toast.warning('Your session will expire soon. Please save your work.', {
              duration: 10000
            });
            logSecurityEvent('session_expiry_warning', 'Session expiring soon');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, logSecurityEvent]);

  // Update stats based on alerts
  useEffect(() => {
    setStats({
      totalEvents: alerts.length,
      averageRiskScore: alerts.length > 0 ? 
        Math.round(alerts.reduce((sum, alert) => {
          const score = alert.severity === 'critical' ? 90 : 
                       alert.severity === 'high' ? 70 : 
                       alert.severity === 'medium' ? 50 : 30;
          return sum + score;
        }, 0) / alerts.length) : 0
    });
  }, [alerts]);

  return { 
    logSecurityEvent, 
    alerts, 
    stats, 
    isMonitoring, 
    handleAlert 
  };
};
