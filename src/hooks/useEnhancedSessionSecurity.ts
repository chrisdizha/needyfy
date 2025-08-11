
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
}

interface SecurityAlert {
  id: string;
  type: 'session_hijack' | 'unusual_location' | 'device_change' | 'concurrent_sessions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const useEnhancedSessionSecurity = () => {
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    isActive: false,
    lastActivity: new Date(),
    sessionDuration: 0,
    deviceFingerprint: '',
    suspiciousActivity: false,
    riskScore: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [sessionStartTime] = useState(new Date());
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
  }, [sessionMetrics.lastActivity, sessionStartTime, toast]);

  // Initialize device fingerprint and activity tracking
  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setSessionMetrics(prev => ({
      ...prev,
      deviceFingerprint: fingerprint,
      isActive: true
    }));

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Set up periodic security checks
    const securityCheckInterval = setInterval(detectSuspiciousActivity, 60000); // Every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(securityCheckInterval);
    };
  }, [updateActivity, detectSuspiciousActivity, generateDeviceFingerprint]);

  // Monitor session validity
  useEffect(() => {
    if (currentSession) {
      // Session exists and is valid
      setSessionMetrics(prev => ({
        ...prev,
        isActive: true
      }));
    } else {
      // No valid session
      setSessionMetrics(prev => ({
        ...prev,
        isActive: false
      }));
    }
  }, [currentSession]);

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
        riskScore: 0
      });
      setAlerts([]);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  }, []);

  return {
    sessionMetrics,
    alerts: getActiveAlerts(),
    resolveAlert,
    terminateSession,
    isSessionValid: !!currentSession,
    securityScore: Math.max(0, 100 - sessionMetrics.riskScore)
  };
};
