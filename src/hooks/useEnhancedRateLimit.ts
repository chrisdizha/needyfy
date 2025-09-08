
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

      // Call the enhanced rate limiting function
      const { data, error } = await supabase.rpc('check_enhanced_rate_limit', {
        p_identifier: config.identifier || `${Date.now()}_${Math.random()}`,
        p_max_requests: config.maxRequests,
        p_window_minutes: Math.ceil(config.windowSeconds / 60),
        p_action_type: config.identifier?.split('_')[0] || 'general'
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowSeconds * 1000, violationCount };
      }

      if (!data) {
        return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowSeconds * 1000, violationCount };
      }

      // Type-safe data handling
      const rateLimitData = data as any;
      
      if (!rateLimitData.allowed) {
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        
        // Progressive blocking handled by backend function
        if (rateLimitData.block_until) {
          const blockUntil = new Date(rateLimitData.block_until).getTime();
          localStorage.setItem(blockKey, blockUntil.toString());
          setIsBlocked(true);
          
          setTimeout(() => {
            setIsBlocked(false);
            localStorage.removeItem(blockKey);
          }, blockUntil - Date.now());
        }
        
        const resetTime = rateLimitData.reset_time 
          ? new Date(rateLimitData.reset_time).toLocaleTimeString()
          : 'later';
        toast.error(rateLimitData.message || `Rate limit exceeded. Try again at ${resetTime}`);
      } else {
        // Reset violation count on successful request
        setViolationCount(0);
      }

      return {
        allowed: rateLimitData.allowed || false,
        remaining: rateLimitData.remaining || 0,
        resetTime: rateLimitData.reset_time || Date.now() + config.windowSeconds * 1000,
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
