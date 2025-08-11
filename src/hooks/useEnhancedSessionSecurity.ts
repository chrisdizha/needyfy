
import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionMetrics {
  isActive: boolean;
  lastActivity: Date;
  sessionDuration: number;
  deviceFingerprint: string;
  suspiciousActivity: boolean;
  riskScore: number;
  sessionAge: number;
  timeUntilExpiry: number;
  threats: string[];
}

interface SecurityAlert {
  id: string;
  type: 'session_hijack' | 'unusual_location' | 'device_change' | 'concurrent_sessions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface SecurityMetrics {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  securityScore: number;
  sessionAge: number;
  timeUntilExpiry: number;
  threats: string[];
}

export const useEnhancedSessionSecurity = () => {
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    isActive: false,
    lastActivity: new Date(),
    sessionDuration: 0,
    deviceFingerprint: '',
    suspiciousActivity: false,
    riskScore: 0,
    sessionAge: 0,
    timeUntilExpiry: 0,
    threats: []
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [sessionStartTime] = useState(new Date());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastSecurityCheck, setLastSecurityCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Needyfy Security', 10, 10);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = btoa([
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvasFingerprint.slice(-50)
    ].join('|'));
    
    return fingerprint;
  }, []);

  // Monitor session activity
  const { data: currentSession } = useQuery({
    queryKey: ['current-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Calculate session metrics
  const calculateSessionMetrics = useCallback(() => {
    const now = new Date();
    const sessionAge = Math.floor((now.getTime() - sessionStartTime.getTime()) / (1000 * 60)); // in minutes
    
    let timeUntilExpiry = 0;
    if (currentSession?.expires_at) {
      timeUntilExpiry = Math.floor((currentSession.expires_at * 1000 - now.getTime()) / (1000 * 60)); // in minutes
    }

    const threats: string[] = [];
    if (sessionAge > 480) { // 8 hours
      threats.push('Long session duration detected');
    }
    if (timeUntilExpiry < 5 && timeUntilExpiry > 0) {
      threats.push('Session expiring soon');
    }

    setSessionMetrics(prev => ({
      ...prev,
      sessionAge,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
      threats
    }));
  }, [currentSession, sessionStartTime]);

  // Track user activity
  const updateActivity = useCallback(() => {
    setSessionMetrics(prev => ({
      ...prev,
      lastActivity: new Date(),
      isActive: true,
      sessionDuration: Date.now() - sessionStartTime.getTime()
    }));
  }, [sessionStartTime]);

  // Detect suspicious activity
  const detectSuspiciousActivity = useCallback(() => {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - sessionMetrics.lastActivity.getTime();
    const sessionDuration = now.getTime() - sessionStartTime.getTime();
    
    let riskScore = 0;
    let suspicious = false;
    const newAlerts: SecurityAlert[] = [];

    // Check for unusual session duration (> 8 hours)
    if (sessionDuration > 8 * 60 * 60 * 1000) {
      riskScore += 30;
      suspicious = true;
      newAlerts.push({
        id: `long-session-${Date.now()}`,
        type: 'session_hijack',
        severity: 'medium',
        message: 'Unusually long session detected',
        timestamp: now,
        resolved: false
      });
    }

    // Check for rapid activity bursts
    if (timeSinceLastActivity < 100) {
      riskScore += 20;
    }

    // Update metrics
    setSessionMetrics(prev => ({
      ...prev,
      suspiciousActivity: suspicious,
      riskScore: Math.min(riskScore, 100)
    }));

    // Add new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      
      // Show toast for high-risk alerts
      newAlerts.forEach(alert => {
        if (alert.severity === 'high' || alert.severity === 'critical') {
          toast({
            title: "Security Alert",
            description: alert.message,
            variant: "destructive",
          });
        }
      });
    }

    setLastSecurityCheck(now);
  }, [sessionMetrics.lastActivity, sessionStartTime, toast]);

  // Initialize device fingerprint and activity tracking
  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setSessionMetrics(prev => ({
      ...prev,
      deviceFingerprint: fingerprint,
      isActive: true
    }));
    setIsMonitoring(true);

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Set up periodic security checks
    const securityCheckInterval = setInterval(() => {
      detectSuspiciousActivity();
      calculateSessionMetrics();
    }, 60000); // Every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(securityCheckInterval);
      setIsMonitoring(false);
    };
  }, [updateActivity, detectSuspiciousActivity, calculateSessionMetrics, generateDeviceFingerprint]);

  // Monitor session validity
  useEffect(() => {
    if (currentSession) {
      // Session exists and is valid
      setSessionMetrics(prev => ({
        ...prev,
        isActive: true
      }));
      calculateSessionMetrics();
    } else {
      // No valid session
      setSessionMetrics(prev => ({
        ...prev,
        isActive: false
      }));
    }
  }, [currentSession, calculateSessionMetrics]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  }, []);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.resolved);
  }, [alerts]);

  const terminateSession = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSessionMetrics({
        isActive: false,
        lastActivity: new Date(),
        sessionDuration: 0,
        deviceFingerprint: '',
        suspiciousActivity: false,
        riskScore: 0,
        sessionAge: 0,
        timeUntilExpiry: 0,
        threats: []
      });
      setAlerts([]);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  }, []);

  const refreshSessionSecurity = useCallback(async () => {
    detectSuspiciousActivity();
    calculateSessionMetrics();
    toast({
      title: "Session Security Refreshed",
      description: "Security checks have been updated",
    });
  }, [detectSuspiciousActivity, calculateSessionMetrics, toast]);

  // Create security metrics object for compatibility
  const securityMetrics: SecurityMetrics = {
    riskLevel: sessionMetrics.riskScore > 70 ? 'critical' : 
               sessionMetrics.riskScore > 50 ? 'high' :
               sessionMetrics.riskScore > 30 ? 'medium' : 'low',
    securityScore: Math.max(0, 100 - sessionMetrics.riskScore),
    sessionAge: sessionMetrics.sessionAge,
    timeUntilExpiry: sessionMetrics.timeUntilExpiry,
    threats: sessionMetrics.threats
  };

  return {
    sessionMetrics,
    alerts: getActiveAlerts(),
    resolveAlert,
    terminateSession,
    isSessionValid: !!currentSession,
    securityScore: Math.max(0, 100 - sessionMetrics.riskScore),
    securityMetrics,
    isMonitoring,
    lastSecurityCheck,
    refreshSessionSecurity
  };
};
