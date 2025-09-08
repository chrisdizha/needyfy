
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useSecureAuthSafe } from './useSecureAuthSafe';
import { toast } from 'sonner';

interface SecureBooking {
  id: string;
  equipment_id: string;
  equipment_title: string | null;
  start_date: string;
  end_date: string;
  total_price?: number; // Optional for providers who see masked data
  base_price?: number; // What providers can see
  status: string;
  owner_id?: string;
  user_id?: string;
  created_at: string;
}

export const useSecureBookings = (userType: 'owner' | 'renter' = 'renter') => {
  const { user } = useAuth();
  const { logSecurityEvent, validateSession } = useSecureAuthSafe();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['secure-bookings', user?.id, userType],
    queryFn: async () => {
      if (!user?.id) return [];

      // Validate session before accessing financial data
      const sessionValid = await validateSession();
      if (!sessionValid) {
        throw new Error('Session validation failed');
      }

      // Use secure function for providers to get masked financial data
      if (userType === 'owner') {
        const { data, error } = await supabase
          .rpc('get_provider_earnings_summary', { provider_user_id: user.id });
        
        if (error) {
          await logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: Date.now(),
            details: `Provider earnings access failed: ${error.message}`
          });
          throw error;
        }
        
        // For provider view, get basic booking info without sensitive data
        const { data: providerBookings, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            equipment_id,
            equipment_title,
            start_date,
            end_date,
            base_price,
            status,
            owner_id,
            created_at
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
          
        if (bookingError) {
          throw bookingError;
        }
        
        return (providerBookings as SecureBooking[]) || [];
      } else {
        // Renters can see full financial details
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            equipment_id,
            equipment_title,
            start_date,
            end_date,
            total_price,
            status,
            owner_id,
            user_id,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        return (data as SecureBooking[]) || [];
      }

      // Log successful access to financial data
      await logSecurityEvent({
        type: 'login',
        timestamp: Date.now(),
        details: `Booking data accessed as ${userType}`
      });
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute cache for financial data
    retry: (failureCount, error) => {
      if (error?.message?.includes('Session validation failed')) {
        return false;
      }
      return failureCount < 1; // Reduced retries for financial data
    },
  });

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    
    try {
      // Validate session and ownership
      const sessionValid = await validateSession();
      if (!sessionValid) {
        throw new Error('Session validation failed');
      }

      // Verify booking ownership before update
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking || booking.owner_id !== user.id) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Unauthorized booking update attempt: ${bookingId}`
        });
        throw new Error('Unauthorized: You can only update your own bookings');
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .eq('owner_id', user.id); // Double-check ownership

      if (error) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Booking update failed: ${error.message}`
        });
        throw error;
      }

      // Log successful update
      await logSecurityEvent({
        type: 'login',
        timestamp: Date.now(),
        details: `Booking status updated: ${bookingId} -> ${newStatus}`
      });

      queryClient.invalidateQueries({ queryKey: ['secure-bookings'] });
      toast.success('Booking status updated');
      
    } catch (error) {
      console.error('Booking update error:', error);
      toast.error('Failed to update booking status');
      throw error;
    }
  };

  return {
    bookings,
    isLoading,
    error,
    refetch,
    updateBookingStatus
  };
};
