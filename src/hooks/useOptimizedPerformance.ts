import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  renderCount: number;
  errorCount: number;
}

// Memory usage tracking with throttling
export const useMemoryTracking = (componentName: string) => {
  const lastCheck = useRef(0);
  const { trackEvent } = useAnalytics();

  const checkMemoryUsage = useCallback(() => {
    const now = Date.now();
    if (now - lastCheck.current < 30000) return; // Only check every 30 seconds
    
    lastCheck.current = now;
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      // Track if memory usage is high
      if (usedMB > 100) {
        trackEvent({
          action: 'performance_warning',
          category: 'performance',
          label: componentName,
          metadata: {
            memoryUsage: usedMB,
            type: 'high_memory'
          }
        });
      }
      
      return usedMB;
    }
    return 0;
  }, [componentName, trackEvent]);

  useEffect(() => {
    const interval = setInterval(checkMemoryUsage, 30000);
    return () => clearInterval(interval);
  }, [checkMemoryUsage]);

  return { checkMemoryUsage };
};

// Optimized render tracking
export const useRenderTracking = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(0);
  const { trackEvent } = useAnalytics();

  const trackRender = useCallback(() => {
    renderCount.current += 1;
    
    // Only track every 10th render to reduce overhead
    if (renderCount.current % 10 === 0) {
      trackEvent({
        action: 'performance_metric',
        category: 'performance',
        label: componentName,
        metadata: {
          renderCount: renderCount.current,
          type: 'render_frequency'
        }
      });
    }
  }, [componentName, trackEvent]);

  const startRenderMeasurement = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endRenderMeasurement = useCallback(() => {
    const renderTime = performance.now() - startTime.current;
    
    // Only track slow renders
    if (renderTime > 16) { // > 16ms (60fps threshold)
      trackEvent({
        action: 'performance_warning',
        category: 'performance',
        label: componentName,
        metadata: {
          renderTime,
          type: 'slow_render'
        }
      });
    }
  }, [componentName, trackEvent]);

  useEffect(() => {
    trackRender();
  });

  return { startRenderMeasurement, endRenderMeasurement };
};

// Bundle size and loading performance
export const useBundlePerformance = () => {
  const { trackEvent } = useAnalytics();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Track initial load performance
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0
      };

      // Get paint metrics if available
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      // Track LCP if available
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.largestContentfulPaint = entry.startTime;
            }
          });
          
          trackEvent({
            action: 'performance_metric',
            category: 'performance',
            label: 'page_load',
            metadata: metrics
          });
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP not supported
        }
      }

      // Track basic metrics immediately
      setTimeout(() => {
        trackEvent({
          action: 'performance_metric',
          category: 'performance',
          label: 'page_load',
          metadata: metrics
        });
      }, 1000);
    }
  }, [trackEvent]);
};

// Error boundary performance tracking
export const useErrorTracking = (componentName: string) => {
  const { trackError } = useAnalytics();

  const trackComponentError = useCallback((error: Error, errorInfo?: any) => {
    trackError(error, {
      component: componentName,
      errorInfo
    });
  }, [componentName, trackError]);

  return { trackComponentError };
};

// Composite hook for complete performance monitoring
export const useOptimizedPerformance = (componentName: string) => {
  const { checkMemoryUsage } = useMemoryTracking(componentName);
  const { startRenderMeasurement, endRenderMeasurement } = useRenderTracking(componentName);
  const { trackComponentError } = useErrorTracking(componentName);
  
  useBundlePerformance();

  const performanceAPI = useMemo(() => ({
    checkMemoryUsage,
    startRenderMeasurement,
    endRenderMeasurement,
    trackComponentError
  }), [checkMemoryUsage, startRenderMeasurement, endRenderMeasurement, trackComponentError]);

  return performanceAPI;
};