import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useSecureAuthSafe } from './useSecureAuthSafe';

interface ProviderEarnings {
  total_bookings: number;
  total_earnings: number;
  pending_earnings: number;
  completed_earnings: number;
}

export const useProviderEarningsSecure = (providerId?: string) => {
  const { user } = useAuth();
  const { validateSession, logSecurityEvent } = useSecureAuthSafe();
  
  const targetProviderId = providerId || user?.id;

  const { data: earnings, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-earnings-secure', targetProviderId],
    queryFn: async (): Promise<ProviderEarnings> => {
      if (!targetProviderId) {
        throw new Error('Provider ID required');
      }

      // Validate session before accessing financial data
      const sessionValid = await validateSession();
      if (!sessionValid) {
        throw new Error('Session validation failed');
      }

      // Use the secure function to get earnings summary
      const { data, error } = await supabase
        .rpc('get_provider_earnings_summary', { 
          provider_user_id: targetProviderId 
        });

      if (error) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Provider earnings access failed: ${error.message}`
        });
        throw error;
      }

      // Log successful access
      await logSecurityEvent({
        type: 'login',
        timestamp: Date.now(),
        details: `Provider earnings accessed for ${targetProviderId}`
      });

      return data?.[0] || {
        total_bookings: 0,
        total_earnings: 0,
        pending_earnings: 0,
        completed_earnings: 0
      };
    },
    enabled: !!targetProviderId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache for earnings data
    retry: (failureCount, error) => {
      if (error?.message?.includes('Session validation failed') || 
          error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    earnings,
    isLoading,
    error,
    refetch
  };
};