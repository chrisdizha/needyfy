import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityContextType {
  csrfToken: string | null;
  isSecurityValidated: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  securityScore: number;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const EnhancedSecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user } = useAuth();
  const { csrfToken } = useCSRFProtection();
  const { securityEvents, sessionCount } = useSecureAuth();
  const [isSecurityValidated, setIsSecurityValidated] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [securityScore, setSecurityScore] = useState(100);

  // Calculate security score based on various factors
  useEffect(() => {
    const calculateSecurityScore = () => {
      let score = 100;
      
      // Deduct points for security events
      const criticalEvents = securityEvents.filter(event => 
        ['suspicious_activity', 'multiple_sessions'].includes(event.type)
      );
      score -= criticalEvents.length * 20;
      
      // Deduct points for multiple sessions
      if (sessionCount > 1) {
        score -= (sessionCount - 1) * 10;
      }
      
      // Deduct points if CSRF token is missing
      if (!csrfToken) {
        score -= 30;
      }
      
      // Ensure score doesn't go below 0
      score = Math.max(0, score);
      
      setSecurityScore(score);
      
      // Set threat level based on score
      if (score >= 80) {
        setThreatLevel('low');
      } else if (score >= 50) {
        setThreatLevel('medium');
      } else {
        setThreatLevel('high');
      }
    };
    
    calculateSecurityScore();
  }, [securityEvents, sessionCount, csrfToken]);

  // Monitor for security anomalies
  useEffect(() => {
    if (!user) return;

    const checkSecurityAnomalies = async () => {
      try {
        // Check for unusual activity patterns
        const recentEvents = securityEvents.filter(event => 
          Date.now() - event.timestamp < 300000 // Last 5 minutes
        );
        
        if (recentEvents.length > 5) {
          toast.warning('Unusual security activity detected. Your session is being monitored.');
          
          // Log the anomaly
          await supabase.rpc('log_security_event', {
            p_user_id: user.id,
            p_event_type: 'anomaly_detected',
            p_event_details: {
              recent_events_count: recentEvents.length,
              threat_level: threatLevel,
              security_score: securityScore
            },
            p_risk_level: 'medium'
          });
        }
      } catch (error) {
        console.error('Security anomaly check failed:', error);
      }
    };

    const intervalId = setInterval(checkSecurityAnomalies, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [user, securityEvents, threatLevel, securityScore]);

  // Validate security status
  useEffect(() => {
    const validateSecurity = () => {
      const hasCSRF = !!csrfToken;
      const scoreThreshold = threatLevel === 'high' ? 30 : 50;
      const isValidated = hasCSRF && securityScore >= scoreThreshold;
      
      setIsSecurityValidated(isValidated);
      
      if (!isValidated && user) {
        console.warn('Security validation failed', {
          hasCSRF,
          securityScore,
          threatLevel
        });
      }
    };
    
    validateSecurity();
  }, [csrfToken, securityScore, threatLevel, user]);

  const contextValue: SecurityContextType = {
    csrfToken,
    isSecurityValidated,
    threatLevel,
    securityScore
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};