import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useMemo } from 'react';

// Optimized equipment query with better caching and batching
export const useOptimizedEquipmentDatabase = () => {
  const queryClient = useQueryClient();

  // Batch multiple equipment queries together
  const batchEquipmentQueries = useCallback(async (queries: Array<{ key: string; query: any }>) => {
    const results = await Promise.allSettled(
      queries.map(({ query }) => query)
    );
    
    return results.map((result, index) => ({
      key: queries[index].key,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }, []);

  // Optimized equipment search with intelligent caching
  const searchEquipment = useCallback(async (filters: any) => {
    const cacheKey = JSON.stringify(filters);
    
    // Check if we have cached data first
    const cached = queryClient.getQueryData(['equipment', 'search', cacheKey]);
    if (cached) return cached;

    let query = supabase
      .from('equipment_listings')
      .select(`
        id,
        title,
        category,
        price,
        price_unit,
        location,
        photos,
        rating,
        total_ratings,
        is_verified,
        created_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters efficiently
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query.limit(filters.limit || 20);
    
    if (error) throw error;
    return data;
  }, [queryClient]);

  // Prefetch related data
  const prefetchRelatedData = useCallback(async (equipmentId: string) => {
    // Prefetch reviews, owner profile, and related equipment in parallel
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['reviews', equipmentId],
        queryFn: () => supabase
          .from('reviews')
          .select('*')
          .eq('equipment_id', equipmentId)
          .order('created_at', { ascending: false })
          .limit(5),
        staleTime: 10 * 60 * 1000 // 10 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: ['equipment', 'related', equipmentId],
        queryFn: async () => {
          const { data: equipment } = await supabase
            .from('equipment_listings')
            .select('category, owner_id')
            .eq('id', equipmentId)
            .single();
            
          if (!equipment) return [];
          
          return supabase
            .from('equipment_listings')
            .select('id, title, price, photos, category')
            .eq('category', equipment.category)
            .neq('id', equipmentId)
            .eq('status', 'active')
            .limit(4);
        },
        staleTime: 15 * 60 * 1000 // 15 minutes
      })
    ];

    await Promise.allSettled(prefetchPromises);
  }, [queryClient]);

  // Optimized user data fetching
  const getUserData = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, suspended')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  }, []);

  return {
    batchEquipmentQueries,
    searchEquipment,
    prefetchRelatedData,
    getUserData
  };
};

// Optimized booking queries
export const useOptimizedBookingDatabase = () => {
  const queryClient = useQueryClient();

  const getUserBookings = useCallback(async (userId: string, limit = 10) => {
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
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }, []);

  const getProviderBookings = useCallback(async (ownerId: string, limit = 10) => {
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
        created_at,
        user_id
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }, []);

  return {
    getUserBookings,
    getProviderBookings
  };
};

// Optimized caching strategies
export const useOptimizedCaching = () => {
  const queryClient = useQueryClient();

  // Intelligent cache invalidation
  const invalidateRelatedQueries = useCallback((type: string, id?: string) => {
    switch (type) {
      case 'equipment':
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        if (id) {
          queryClient.invalidateQueries({ queryKey: ['equipment', id] });
          queryClient.invalidateQueries({ queryKey: ['reviews', id] });
        }
        break;
      case 'booking':
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
        break;
      case 'user':
        if (id) {
          queryClient.invalidateQueries({ queryKey: ['user', id] });
          queryClient.invalidateQueries({ queryKey: ['bookings', id] });
        }
        break;
    }
  }, [queryClient]);

  // Preload critical data
  const preloadCriticalData = useCallback(async (userId?: string) => {
    if (!userId) return;

    const criticalQueries = [
      // User's active bookings
      queryClient.prefetchQuery({
        queryKey: ['bookings', 'active', userId],
        queryFn: () => supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['pending', 'confirmed'])
          .limit(5),
        staleTime: 2 * 60 * 1000 // 2 minutes
      }),
      // User's equipment listings
      queryClient.prefetchQuery({
        queryKey: ['equipment', 'user', userId],
        queryFn: () => supabase
          .from('equipment_listings')
          .select('id, title, status, price')
          .eq('owner_id', userId)
          .limit(10),
        staleTime: 5 * 60 * 1000 // 5 minutes
      })
    ];

    await Promise.allSettled(criticalQueries);
  }, [queryClient]);

  return {
    invalidateRelatedQueries,
    preloadCriticalData
  };
};