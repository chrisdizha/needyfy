
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedDatabase } from './useOptimizedDatabase';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedQueries = () => {
  const queryClient = useQueryClient();
  const { executeQuery, paginatedQuery, invalidateRelatedCache } = useOptimizedDatabase();

  // Optimized equipment queries
  const useOptimizedEquipmentList = (filters: any = {}) => {
    return useQuery({
      queryKey: ['equipment', 'list', filters],
      queryFn: () => executeQuery(
        () => {
          let query = supabase
            .from('equipment')
            .select(`
              *,
              profiles:owner_id (
                first_name,
                last_name,
                avatar_url
              ),
              equipment_images (
                id,
                image_url,
                is_primary
              )
            `);

          if (filters.category) {
            query = query.eq('category', filters.category);
          }
          
          if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
          }
          
          if (filters.available_from && filters.available_to) {
            query = query.gte('available_from', filters.available_from)
                         .lte('available_to', filters.available_to);
          }

          return query.eq('is_available', true);
        },
        {
          cacheKey: `equipment_list_${JSON.stringify(filters)}`,
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
        return paginatedQuery('equipment', {
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

  // Optimized single equipment query
  const useOptimizedEquipmentDetails = (id: string) => {
    return useQuery({
      queryKey: ['equipment', 'details', id],
      queryFn: () => executeQuery(
        () => supabase
          .from('equipment')
          .select(`
            *,
            profiles:owner_id (
              id,
              first_name,
              last_name,
              avatar_url,
              verification_status
            ),
            equipment_images (
              id,
              image_url,
              is_primary
            ),
            reviews (
              id,
              rating,
              comment,
              created_at,
              profiles:reviewer_id (
                first_name,
                last_name,
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

  // Optimized mutation with cache updates
  const useOptimizedEquipmentMutation = () => {
    return useMutation({
      mutationFn: async (equipmentData: any) => {
        const { data, error } = await supabase
          .from('equipment')
          .insert(equipmentData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        invalidateRelatedCache('equipment', 'insert');
        
        // Optimistically update cache
        queryClient.setQueryData(['equipment', 'details', data.id], data);
      }
    });
  };

  // Optimized user bookings
  const useOptimizedUserBookings = (userId: string) => {
    return useQuery({
      queryKey: ['bookings', 'user', userId],
      queryFn: () => executeQuery(
        () => supabase
          .from('bookings')
          .select(`
            *,
            equipment (
              id,
              title,
              daily_rate,
              equipment_images (
                image_url,
                is_primary
              )
            )
          `)
          .eq('renter_id', userId)
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
