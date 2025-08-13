
import { useCallback } from 'react';

export const usePrefetch = () => {
  const prefetchRoute = useCallback((routePath: string) => {
    // Prefetch the route module
    import(`../pages/${routePath}.tsx`).catch(() => {
      // Silently fail if route doesn't exist
    });
  }, []);

  const prefetchOnHover = useCallback((routePath: string) => {
    return {
      onMouseEnter: () => prefetchRoute(routePath),
      onFocus: () => prefetchRoute(routePath),
    };
  }, [prefetchRoute]);

  return { prefetchRoute, prefetchOnHover };
};
