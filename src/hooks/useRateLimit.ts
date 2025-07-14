import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  identifier?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export const useRateLimit = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = useCallback(async (config: RateLimitConfig): Promise<RateLimitResult> => {
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          requests: config.maxRequests,
          windowSeconds: config.windowSeconds,
          identifier: config.identifier || `${Date.now()}_${Math.random()}`
        }
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Fail open - allow request if rate limiter is down
        return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowSeconds * 1000 };
      }

      if (!data.allowed) {
        const resetTime = new Date(data.resetTime).toLocaleTimeString();
        toast.error(`Rate limit exceeded. Try again at ${resetTime}`);
      }

      return {
        allowed: data.allowed,
        remaining: data.remaining,
        resetTime: data.resetTime
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open for better UX
      return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowSeconds * 1000 };
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { checkRateLimit, isChecking };
};