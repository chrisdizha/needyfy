
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimized query configurations
export const queryConfig = {
  // Short-lived data
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  // Medium-lived data
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  // Long-lived data
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  }
};

// Define filter types explicitly
interface EquipmentFilters {
  category?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  [key: string]: string | number | undefined;
}

// Optimized equipment queries
export const useOptimizedEquipmentQuery = (limit: number = 10, filters: EquipmentFilters = {}) => {
  return useQuery({
    queryKey: ['equipment', JSON.stringify(filters), limit] as const,
    queryFn: async () => {
      let query = supabase
        .from('equipment_listings')
        .select('*')
        .eq('status', 'active');

      // Apply filters efficiently
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    ...queryConfig.standard,
  });
};

// Optimized user data queries
export const useOptimizedUserQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-profile', userId] as const,
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    ...queryConfig.static,
  });
};

// Prefetch critical data
export const usePrefetchCriticalData = (user: { id?: string } | null) => {
  useQuery({
    queryKey: ['user-equipment', user?.id] as const,
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('id, title, status, price')
        .eq('owner_id', user.id)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    ...queryConfig.standard,
  });
};
