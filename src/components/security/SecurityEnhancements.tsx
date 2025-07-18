
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced input validation utilities
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },
  
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};

// Rate limiting hook for form submissions
export const useFormRateLimit = (maxAttempts: number = 5, windowMs: number = 60000) => {
  const [attempts, setAttempts] = useState<number[]>([]);
  
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      toast.error(`Too many attempts. Please wait ${Math.ceil(windowMs / 60000)} minute(s) before trying again.`);
      return false;
    }
    
    setAttempts([...recentAttempts, now]);
    return true;
  };
  
  return { checkRateLimit };
};

// Session security monitoring
export const useSessionSecurity = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs/minimized - potential security concern
        const timeDiff = Date.now() - lastActivity;
        if (timeDiff > 30000) { // 30 seconds of inactivity
          setSuspiciousActivity(true);
        }
      }
    };
    
    // Monitor user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for suspicious patterns
    const securityCheck = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      // If user has been inactive for too long, flag as suspicious
      if (timeSinceActivity > 1800000) { // 30 minutes
        setSuspiciousActivity(true);
        toast.warning('Extended inactivity detected. Please verify your identity.');
      }
    }, 60000); // Check every minute
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(securityCheck);
    };
  }, [lastActivity]);
  
  return { lastActivity, suspiciousActivity, setSuspiciousActivity };
};

// Device fingerprinting for session validation
export const getDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    canvas: canvas.toDataURL(),
  };
  
  return btoa(JSON.stringify(fingerprint));
};

export const SecurityEnhancements = () => {
  return null; // This is a utility component
};
