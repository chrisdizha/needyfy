
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
  total_price: number;
  status: string;
  owner_id: string;
  user_id: string;
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

      // Use role-specific query with strict filtering
      const column = userType === 'owner' ? 'owner_id' : 'user_id';
      
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
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Booking access failed: ${error.message}`
        });
        throw error;
      }

      // Log successful access to financial data
      await logSecurityEvent({
        type: 'login',
        timestamp: Date.now(),
        details: `Booking data accessed as ${userType}`
      });

      return (data as SecureBooking[]) || [];
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
