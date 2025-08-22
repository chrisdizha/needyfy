
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedDatabase } from './useOptimizedDatabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import type { EquipmentListing, PublicEquipmentPreview } from './useEquipmentListings';

export const useOptimizedQueries = () => {
  const queryClient = useQueryClient();
  const { executeQuery, paginatedQuery, invalidateRelatedCache } = useOptimizedDatabase();
  const { user } = useAuth();

  // Optimized equipment queries with authentication-aware data access
  const useOptimizedEquipmentList = (filters: any = {}) => {
    return useQuery({
      queryKey: ['equipment', 'list', filters, user ? 'authenticated' : 'public'],
      queryFn: () => executeQuery(
        async () => {
          if (user) {
            // Authenticated users get full equipment details
            let query = supabase
              .from('equipment_listings')
              .select(`
                *,
                profiles:owner_id (
                  id,
                  full_name,
                  avatar_url
                )
              `);

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

            query = query.eq('status', 'active');
            
            const { data, error } = await query;
            if (error) throw error;
            return data as EquipmentListing[];
          } else {
            // Anonymous users get limited preview data
            let query = supabase
              .from('equipment_listings')
              .select('id, title, category, price, price_unit, photos, rating, total_ratings, is_verified, location, created_at');

            if (filters.category) {
              query = query.eq('category', filters.category);
            }
            
            if (filters.minPrice) {
              query = query.gte('price', filters.minPrice);
            }
            
            if (filters.maxPrice) {
              query = query.lte('price', filters.maxPrice);
            }

            query = query.eq('status', 'active');
            
            const { data, error } = await query;
            if (error) throw error;
            
            // Transform to PublicEquipmentPreview format
            return data?.map(item => ({
              id: item.id,
              title: item.title,
              category: item.category,
              price: item.price,
              price_unit: item.price_unit,
              photos: item.photos ? [item.photos[0]] : [],
              rating: item.rating || 0,
              total_ratings: item.total_ratings || 0,
              is_verified: item.is_verified || false,
              general_location: item.location ? 
                item.location.split(',')[0] + ', ' + item.location.split(',').slice(-1)[0] : 
                'Location not specified',
              created_at: item.created_at
            })) as PublicEquipmentPreview[];
          }
        },
        {
          cacheKey: `equipment_list_${JSON.stringify(filters)}_${user ? 'auth' : 'anon'}`,
          cacheTTL: 10 * 60 * 1000 // 10 minutes
        }
      ),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000 // 30 minutes
    });
  };

  // Infinite scroll for equipment
  const useInfiniteEquipmentList = (filters: any = {}) => {
    return useInfiniteQuery({
      queryKey: ['equipment', 'infinite', filters],
      queryFn: async ({ pageParam = 1 }) => {
        return paginatedQuery('equipment_listings', {
          page: pageParam,
          pageSize: 12,
          filters,
          sortBy: 'created_at',
          cacheKey: `equipment_infinite_${JSON.stringify(filters)}`
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.hasMore ? allPages.length + 1 : undefined;
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000
    });
  };

  const useOptimizedEquipmentDetails = (id: string) => {
    return useQuery({
      queryKey: ['equipment', 'details', id],
      queryFn: () => executeQuery(
        async () => supabase
          .from('equipment_listings')
          .select(`
            *,
            profiles:owner_id (
              id,
              full_name,
              avatar_url
            ),
            reviews (
              id,
              rating,
              title,
              content,
              created_at,
              profiles:user_id (
                full_name,
                avatar_url
              )
            )
          `)
          .eq('id', id)
          .single(),
        {
          cacheKey: `equipment_details_${id}`,
          cacheTTL: 15 * 60 * 1000 // 15 minutes
        }
      ),
      enabled: !!id,
      staleTime: 10 * 60 * 1000
    });
  };

  const useOptimizedEquipmentMutation = () => {
    return useMutation({
      mutationFn: async (equipmentData: any) => {
        const { data, error } = await supabase
          .from('equipment_listings')
          .insert(equipmentData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        invalidateRelatedCache('equipment_listings', 'insert');
        
        // Optimistically update cache
        queryClient.setQueryData(['equipment', 'details', data.id], data);
      }
    });
  };

  const useOptimizedUserBookings = (userId: string) => {
    return useQuery({
      queryKey: ['bookings', 'user', userId],
      queryFn: () => executeQuery(
        async () => supabase
          .from('bookings')
          .select(`
            *,
            equipment_listings!equipment_id (
              id,
              title,
              price,
              photos
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        {
          cacheKey: `user_bookings_${userId}`,
          cacheTTL: 5 * 60 * 1000
        }
      ),
      enabled: !!userId,
      staleTime: 2 * 60 * 1000
    });
  };

  return {
    useOptimizedEquipmentList,
    useInfiniteEquipmentList,
    useOptimizedEquipmentDetails,
    useOptimizedEquipmentMutation,
    useOptimizedUserBookings
  };
};

// Export individual hooks for convenience
export const useOptimizedEquipmentQuery = (limit: number = 20, filters: any = {}) => {
  const { useOptimizedEquipmentList } = useOptimizedQueries();
  return useOptimizedEquipmentList(filters);
};
