
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useSecureAuthSafe } from './useSecureAuthSafe';
import { toast } from 'sonner';

interface SecurePayout {
  id: string;
  provider_id: string;
  amount: number;
  status: string;
  payout_method: string;
  booking_ids: string[];
  created_at: string;
  processed_at?: string;
}

export const useSecurePayouts = () => {
  const { user } = useAuth();
  const { logSecurityEvent, validateSession } = useSecureAuthSafe();

  const { data: payouts = [], isLoading, error } = useQuery({
    queryKey: ['secure-payouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Enhanced session validation for financial data
      const sessionValid = await validateSession();
      if (!sessionValid) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Attempted payout access with invalid session'
        });
        throw new Error('Session validation failed');
      }

      // Additional rate limiting check for financial data access
      const lastAccess = localStorage.getItem('last_payout_access');
      if (lastAccess && Date.now() - parseInt(lastAccess) < 5000) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Rapid payout data access detected'
        });
        throw new Error('Rate limit exceeded');
      }
      localStorage.setItem('last_payout_access', Date.now().toString());

      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Payout access failed: ${error.message}`
        });
        throw error;
      }

      // Log successful financial data access
      await logSecurityEvent({
        type: 'login',
        timestamp: Date.now(),
        details: 'Payout data accessed successfully'
      });

      return (data as SecurePayout[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds cache for financial data
    retry: false, // No retries for financial data
    refetchOnWindowFocus: false, // Prevent accidental refetches
  });

  const createPayoutRequest = async (amount: number, bookingIds: string[]) => {
    if (!user?.id) throw new Error('Not authenticated');
    
    try {
      // Enhanced validation for payout creation
      const sessionValid = await validateSession();
      if (!sessionValid) {
        throw new Error('Session validation failed');
      }

      // Validate amount is reasonable
      if (amount < 500 || amount > 1000000) { // $5 to $10,000
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Suspicious payout amount requested: ${amount}`
        });
        throw new Error('Invalid payout amount');
      }

      const { data, error } = await supabase
        .from('payout_requests')
        .insert({
          provider_id: user.id,
          amount,
          booking_ids: bookingIds,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Payout creation failed: ${error.message}`
        });
        throw error;
      }

      // Log successful payout request
      await logSecurityEvent({
        type: 'login',
        timestamp: Date.now(),
        details: `Payout request created: ${amount} cents`
      });

      toast.success('Payout request created successfully');
      return data;
      
    } catch (error) {
      console.error('Payout creation error:', error);
      toast.error('Failed to create payout request');
      throw error;
    }
  };

  return {
    payouts,
    isLoading,
    error,
    createPayoutRequest
  };
};
