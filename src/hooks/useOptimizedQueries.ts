import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimized query configurations with better cache management
export const queryConfig = {
  // Real-time data (frequently changing)
  realtime: {
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  // Standard data (moderately changing)
  standard: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  // Static data (rarely changing)
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  // Background data (can be stale)
  background: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }
};

// Define filter types explicitly
interface EquipmentFilters {
  category?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  owner_id?: string;
  search?: string;
}

// Optimized equipment queries with better field selection
export const useOptimizedEquipmentQuery = (
  limit: number = 10, 
  filters: EquipmentFilters = {},
  options: Partial<UseQueryOptions> = {}
) => {
  return useQuery({
    queryKey: ['equipment', filters, limit] as const,
    queryFn: async () => {
      // Select only necessary fields for better performance
      const selectFields = filters.owner_id 
        ? '*' // Full data for owner's equipment
        : 'id, title, category, price, price_unit, location, photos, rating, total_ratings, is_verified, status, created_at';

      let query = supabase
        .from('equipment_listings')
        .select(selectFields)
        .eq('status', 'active');

      // Apply filters efficiently with proper indexing
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }
      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    ...queryConfig.standard,
    ...options,
  });
};

// Infinite query for large equipment lists with virtualization support
export const useInfiniteEquipmentQuery = (filters: EquipmentFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['equipment-infinite', filters] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;
      
      let query = supabase
        .from('equipment_listings')
        .select('id, title, category, price, price_unit, location, photos, rating, total_ratings, is_verified, created_at')
        .eq('status', 'active')
        .range(pageParam, pageParam + pageSize - 1);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      return {
        data: data || [],
        nextCursor: data && data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    ...queryConfig.standard,
  });
};

// Optimized user profile query with minimal data fetching
export const useOptimizedUserQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-profile', userId] as const,
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, updated_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    ...queryConfig.static,
  });
};

// Lightweight equipment count query for quick stats
export const useEquipmentCountQuery = (filters: EquipmentFilters = {}) => {
  return useQuery({
    queryKey: ['equipment-count', filters] as const,
    queryFn: async () => {
      let query = supabase
        .from('equipment_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    ...queryConfig.background,
  });
};

// Prefetch critical data with minimal impact
export const usePrefetchCriticalData = (user: { id?: string } | null) => {
  // User's equipment - lightweight query
  useQuery({
    queryKey: ['user-equipment-summary', user?.id] as const,
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('id, title, status, price, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    ...queryConfig.background,
  });

  // Recent bookings - minimal data
  useQuery({
    queryKey: ['user-bookings-summary', user?.id] as const,
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('id, equipment_title, status, start_date, total_price')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    ...queryConfig.background,
  });
};

// Optimized notifications query with real-time updates
export const useOptimizedNotificationsQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['notifications', userId] as const,
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, read, created_at, expires_at')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    ...queryConfig.realtime,
  });
};