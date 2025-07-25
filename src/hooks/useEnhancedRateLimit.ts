
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  identifier?: string;
  progressiveDelay?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  violationCount: number;
}

export const useEnhancedRateLimit = () => {
  const [violationCount, setViolationCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const checkRateLimit = useCallback(async (config: RateLimitConfig): Promise<RateLimitResult> => {
    try {
      // Check if currently blocked
      const blockKey = `rate_limit_block_${config.identifier || 'default'}`;
      const blockUntil = localStorage.getItem(blockKey);
      
      if (blockUntil && Date.now() < parseInt(blockUntil)) {
        const remainingTime = Math.ceil((parseInt(blockUntil) - Date.now()) / 1000);
        toast.error(`Rate limit exceeded. Try again in ${remainingTime} seconds`);
        return { allowed: false, remaining: 0, resetTime: parseInt(blockUntil), violationCount };
      }

      // Call the rate limiting function
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          requests: config.maxRequests,
          windowSeconds: config.windowSeconds,
          identifier: config.identifier || `${Date.now()}_${Math.random()}`
        }
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowSeconds * 1000, violationCount };
      }

      if (!data.allowed) {
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        
        // Progressive blocking
        let blockDuration = 0;
        if (config.progressiveDelay) {
          blockDuration = Math.min(Math.pow(2, newViolationCount) * 1000, 300000); // Max 5 minutes
        }
        
        if (blockDuration > 0) {
          const blockUntil = Date.now() + blockDuration;
          localStorage.setItem(blockKey, blockUntil.toString());
          setIsBlocked(true);
          
          setTimeout(() => {
            setIsBlocked(false);
            localStorage.removeItem(blockKey);
          }, blockDuration);
        }
        
        // Log security event for repeated violations
        if (newViolationCount >= 3) {
          await supabase.rpc('log_security_event', {
            p_user_id: (await supabase.auth.getUser()).data.user?.id || null,
            p_event_type: 'rate_limit_violation',
            p_event_details: {
              identifier: config.identifier,
              violation_count: newViolationCount,
              max_requests: config.maxRequests,
              window_seconds: config.windowSeconds
            },
            p_risk_level: newViolationCount >= 5 ? 'high' : 'medium'
          });
        }
        
        const resetTime = new Date(data.resetTime).toLocaleTimeString();
        toast.error(`Rate limit exceeded. Try again at ${resetTime}`);
      } else {
        // Reset violation count on successful request
        setViolationCount(0);
      }

      return {
        allowed: data.allowed,
        remaining: data.remaining,
        resetTime: data.resetTime,
        violationCount
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowSeconds * 1000, violationCount };
    }
  }, [violationCount]);

  const resetViolations = useCallback(() => {
    setViolationCount(0);
    setIsBlocked(false);
    // Clear any existing blocks
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rate_limit_block_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return { 
    checkRateLimit, 
    violationCount, 
    isBlocked, 
    resetViolations 
  };
};
