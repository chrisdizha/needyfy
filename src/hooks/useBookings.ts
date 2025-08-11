
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useEffect } from 'react';

interface Booking {
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

export const useBookings = (limit?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'user', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      return (data as Booking[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscription for booking changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('booking-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Booking change detected:', payload);
          // Invalidate and refetch booking data when changes occur
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  // Optimistic update function for immediate UI feedback
  const optimisticUpdate = (bookingId: string, updates: Partial<Booking>) => {
    queryClient.setQueryData(['bookings', 'user', user?.id, limit], (oldData: Booking[] = []) => {
      return oldData.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates }
          : booking
      );
    });
  };

  // Add new booking optimistically
  const addBookingOptimistically = (newBooking: Booking) => {
    queryClient.setQueryData(['bookings', 'user', user?.id, limit], (oldData: Booking[] = []) => {
      return [newBooking, ...oldData];
    });
  };

  return {
    bookings,
    isLoading,
    error,
    refetch,
    optimisticUpdate,
    addBookingOptimistically
  };
};
