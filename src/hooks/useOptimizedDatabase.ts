
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdvancedCaching } from './useAdvancedCaching';

interface QueryOptions {
  cacheKey?: string;
  cacheTTL?: number;
  enableRealtime?: boolean;
  batchSize?: number;
  retries?: number;
}

interface BatchOperation {
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any[];
  conditions?: any;
}

export const useOptimizedDatabase = () => {
  const { getOrSet, invalidate } = useAdvancedCaching();

  // Optimized query execution with caching
  const executeQuery = useCallback(async <T>(
    queryBuilder: () => Promise<{ data: T | null; error: any }>,
    options: QueryOptions = {}
  ): Promise<T | null> => {
    const {
      cacheKey,
      cacheTTL = 5 * 60 * 1000, // 5 minutes default
      retries = 3
    } = options;

    const executeWithRetry = async (attempt = 1): Promise<T | null> => {
      try {
        const { data, error } = await queryBuilder();
        
        if (error) {
          console.error(`Database query error (attempt ${attempt}):`, error);
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            return executeWithRetry(attempt + 1);
          }
          
          throw error;
        }
        
        return data as T | null;
      } catch (error) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          return executeWithRetry(attempt + 1);
        }
        throw error;
      }
    };

    if (cacheKey) {
      return getOrSet(cacheKey, executeWithRetry, cacheTTL) as Promise<T | null>;
    }

    return executeWithRetry();
  }, [getOrSet]);

  // Simplified batch operations
  const executeBatchOperations = useCallback(async (
    operations: BatchOperation[]
  ): Promise<void> => {
    try {
      for (const op of operations) {
        switch (op.operation) {
          case 'insert':
            const { error: insertError } = await supabase.from(op.table as any).insert(op.data);
            if (insertError) throw insertError;
            break;
          case 'update':
            const { error: updateError } = await supabase.from(op.table as any).update(op.data[0]).match(op.conditions);
            if (updateError) throw updateError;
            break;
          case 'delete':
            const { error: deleteError } = await supabase.from(op.table as any).delete().match(op.conditions);
            if (deleteError) throw deleteError;
            break;
        }
      }
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }, []);

  // Optimized pagination with proper typing
  const paginatedQuery = useCallback(async <T = any>(
    tableName: string,
    options: {
      page: number;
      pageSize: number;
      filters?: any;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      cacheKey?: string;
    }
  ): Promise<{ data: T[]; total: number; hasMore: boolean }> => {
    const { page, pageSize, filters, sortBy, sortOrder = 'desc', cacheKey } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const queryFn = async (): Promise<{ data: T[]; total: number; hasMore: boolean }> => {
      try {
        let query = supabase
          .from(tableName as any)
          .select('*', { count: 'exact' })
          .range(from, to);

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          });
        }

        if (sortBy) {
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        }

        const { data, error, count } = await query;
        
        if (error) throw error;

        return {
          data: (data as T[]) || [],
          total: count || 0,
          hasMore: (count || 0) > to + 1
        };
      } catch (error) {
        console.error('Paginated query error:', error);
        // Return properly typed empty result instead of throwing
        return {
          data: [] as T[],
          total: 0,
          hasMore: false
        };
      }
    };

    if (cacheKey) {
      return getOrSet(`${cacheKey}_page_${page}`, queryFn) as Promise<{ data: T[]; total: number; hasMore: boolean }>;
    }

    return queryFn();
  }, [getOrSet]);

  // Real-time subscription management
  const createOptimizedSubscription = useCallback((
    tableName: string,
    callback: (payload: any) => void,
    filters?: any
  ) => {
    let subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: filters
      }, callback);

    // Add connection management
    subscription.subscribe((status) => {
      console.log(`Subscription status for ${tableName}:`, status);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
      subscription
    };
  }, []);

  // Cache invalidation strategies
  const invalidateRelatedCache = useCallback((
    tableName: string,
    operation: 'insert' | 'update' | 'delete'
  ) => {
    // Invalidate table-specific caches
    invalidate(`${tableName}_*`);
    
    // Invalidate related caches based on operation
    switch (tableName) {
      case 'equipment_listings':
        invalidate('featured_equipment');
        invalidate('equipment_list_*');
        invalidate('categories_*');
        break;
      case 'bookings':
        invalidate('user_bookings_*');
        invalidate('provider_bookings_*');
        break;
      case 'reviews':
        invalidate('equipment_reviews_*');
        invalidate('user_reviews_*');
        break;
    }
  }, [invalidate]);

  return {
    executeQuery,
    executeBatchOperations,
    paginatedQuery,
    createOptimizedSubscription,
    invalidateRelatedCache
  };
};
