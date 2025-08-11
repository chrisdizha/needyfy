
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'session_anomaly' | 'access_violation' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  handled: boolean;
}

interface SecurityStats {
  totalEvents: number;
  highRiskEvents: number;
  recentAlerts: number;
  averageRiskScore: number;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const generateSecurityAlert = useCallback((
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    message: string
  ): SecurityAlert => {
    return {
      id: crypto.randomUUID(),
      type,
      severity,
      message,
      timestamp: new Date(),
      handled: false
    };
  }, []);

  const addSecurityAlert = useCallback((alert: SecurityAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    
    // Show toast for high severity alerts
    if (alert.severity === 'critical' || alert.severity === 'high') {
      toast.error(`Security Alert: ${alert.message}`, {
        duration: alert.severity === 'critical' ? 10000 : 6000
      });
    }
  }, []);

  const monitorSecurityPatterns = useCallback(async () => {
    if (!user) return;

    try {
      // Check for recent security events from the database
      const { data: recentEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Failed to fetch security events:', error);
        return;
      }

      if (recentEvents && recentEvents.length > 0) {
        // Analyze patterns
        const suspiciousPatterns = analyzeSuspiciousPatterns(recentEvents);
        
        suspiciousPatterns.forEach(pattern => {
          const alert = generateSecurityAlert(
            'suspicious_activity',
            pattern.severity,
            pattern.message
          );
          addSecurityAlert(alert);
        });

        // Update stats
        const highRiskCount = recentEvents.filter(e => 
          e.risk_level === 'high' || e.risk_level === 'critical'
        ).length;

        setStats({
          totalEvents: recentEvents.length,
          highRiskEvents: highRiskCount,
          recentAlerts: suspiciousPatterns.length,
          averageRiskScore: calculateAverageRiskScore(recentEvents)
        });
      }
    } catch (error) {
      console.error('Security monitoring error:', error);
    }
  }, [user, generateSecurityAlert, addSecurityAlert]);

  const analyzeSuspiciousPatterns = (events: any[]): Array<{severity: SecurityAlert['severity'], message: string}> => {
    const patterns: Array<{severity: SecurityAlert['severity'], message: string}> = [];

    // Pattern 1: Multiple failed login attempts
    const failedLogins = events.filter(e => 
      e.event_type === 'suspicious_activity' && 
      e.event_details?.details?.includes('Login failed')
    );
    if (failedLogins.length > 3) {
      patterns.push({
        severity: 'high',
        message: `${failedLogins.length} failed login attempts detected in the last 24 hours`
      });
    }

    // Pattern 2: Unusual time-based activity
    const nightTimeEvents = events.filter(e => {
      const hour = new Date(e.created_at).getHours();
      return hour >= 23 || hour <= 5; // 11 PM to 5 AM
    });
    if (nightTimeEvents.length > 5) {
      patterns.push({
        severity: 'medium',
        message: `Unusual late-night activity detected (${nightTimeEvents.length} events)`
      });
    }

    // Pattern 3: High frequency of events
    const recentEvents = events.filter(e => 
      new Date(e.created_at).getTime() > Date.now() - (60 * 60 * 1000) // Last hour
    );
    if (recentEvents.length > 20) {
      patterns.push({
        severity: 'high',
        message: `Unusually high activity: ${recentEvents.length} events in the last hour`
      });
    }

    // Pattern 4: Multiple device fingerprint mismatches
    const fingerprintEvents = events.filter(e => 
      e.event_details?.details?.includes('fingerprint mismatch')
    );
    if (fingerprintEvents.length > 2) {
      patterns.push({
        severity: 'critical',
        message: `Multiple device fingerprint mismatches detected - possible account compromise`
      });
    }

    // Pattern 5: Payment-related security events
    const paymentEvents = events.filter(e => 
      e.event_type === 'payment_action' && e.risk_level === 'high'
    );
    if (paymentEvents.length > 0) {
      patterns.push({
        severity: 'high',
        message: `${paymentEvents.length} high-risk payment events detected`
      });
    }

    return patterns;
  };

  const calculateAverageRiskScore = (events: any[]): number => {
    if (events.length === 0) return 0;
    
    const riskScores = events.map(e => {
      switch (e.risk_level) {
        case 'critical': return 100;
        case 'high': return 75;
        case 'medium': return 50;
        case 'low': return 25;
        default: return 0;
      }
    });

    return Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length);
  };

  const handleAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, handled: true } : alert
    ));
  }, []);

  const clearOldAlerts = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    setAlerts(prev => prev.filter(alert => alert.timestamp > oneDayAgo));
  }, []);

  // Start monitoring when user is authenticated
  useEffect(() => {
    if (!user) {
      setIsMonitoring(false);
      setAlerts([]);
      setStats(null);
      return;
    }

    setIsMonitoring(true);
    
    // Initial security check
    monitorSecurityPatterns();

    // Set up periodic monitoring
    const monitoringInterval = setInterval(monitorSecurityPatterns, 5 * 60 * 1000); // Every 5 minutes
    const cleanupInterval = setInterval(clearOldAlerts, 60 * 60 * 1000); // Every hour

    return () => {
      clearInterval(monitoringInterval);
      clearInterval(cleanupInterval);
      setIsMonitoring(false);
    };
  }, [user, monitorSecurityPatterns, clearOldAlerts]);

  return {
    alerts,
    stats,
    isMonitoring,
    handleAlert,
    addSecurityAlert: (type: SecurityAlert['type'], severity: SecurityAlert['severity'], message: string) => {
      const alert = generateSecurityAlert(type, severity, message);
      addSecurityAlert(alert);
    }
  };
};
