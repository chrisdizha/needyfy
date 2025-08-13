
import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export const useAdvancedCaching = <T>(maxSize: number = 100) => {
  const cache = useRef<Map<string, CacheItem<T>>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0
  });

  // LRU eviction strategy
  const evictLRU = useCallback(() => {
    if (cache.current.size <= maxSize) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of cache.current.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.current.delete(oldestKey);
    }
  }, [maxSize]);

  // Smart TTL based on access patterns
  const calculateAdaptiveTTL = useCallback((accessCount: number, baseTime: number = 300000) => {
    // Frequently accessed items get longer TTL
    const multiplier = Math.min(1 + (accessCount / 10), 3);
    return baseTime * multiplier;
  }, []);

  const set = useCallback((key: string, data: T, ttl?: number) => {
    const now = Date.now();
    const existingItem = cache.current.get(key);
    const accessCount = existingItem ? existingItem.accessCount : 0;
    
    const adaptiveTTL = ttl || calculateAdaptiveTTL(accessCount);
    
    cache.current.set(key, {
      data,
      timestamp: now,
      ttl: adaptiveTTL,
      accessCount: accessCount + 1,
      lastAccessed: now
    });

    evictLRU();
    
    setStats(prev => ({
      ...prev,
      size: cache.current.size
    }));
  }, [calculateAdaptiveTTL, evictLRU]);

  const get = useCallback((key: string): T | null => {
    const item = cache.current.get(key);
    const now = Date.now();

    if (!item) {
      setStats(prev => ({
        ...prev,
        misses: prev.misses + 1,
        hitRate: prev.hits / (prev.hits + prev.misses + 1) * 100
      }));
      return null;
    }

    // Check if expired
    if (now - item.timestamp > item.ttl) {
      cache.current.delete(key);
      setStats(prev => ({
        ...prev,
        misses: prev.misses + 1,
        size: cache.current.size,
        hitRate: prev.hits / (prev.hits + prev.misses + 1) * 100
      }));
      return null;
    }

    // Update access patterns
    item.accessCount++;
    item.lastAccessed = now;
    
    setStats(prev => ({
      ...prev,
      hits: prev.hits + 1,
      hitRate: (prev.hits + 1) / (prev.hits + prev.misses + 1) * 100
    }));

    return item.data;
  }, []);

  const invalidate = useCallback((key: string) => {
    const deleted = cache.current.delete(key);
    if (deleted) {
      setStats(prev => ({
        ...prev,
        size: cache.current.size
      }));
    }
    return deleted;
  }, []);

  const clear = useCallback(() => {
    cache.current.clear();
    setStats({
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    });
  }, []);

  const getOrSet = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    set(key, data, ttl);
    return data;
  }, [get, set]);

  // Cleanup expired items periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, item] of cache.current.entries()) {
        if (now - item.timestamp > item.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => cache.current.delete(key));
      
      if (keysToDelete.length > 0) {
        setStats(prev => ({
          ...prev,
          size: cache.current.size
        }));
      }
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    set,
    get,
    invalidate,
    clear,
    getOrSet,
    stats
  };
};
