
import { useEffect, useRef, useCallback } from 'react';
import { analytics } from '@/lib/analytics';

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  memoryUsage?: number;
}

export const useOptimizedPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({ renderCount: 0, renderTime: 0 });

  const trackMemoryUsage = useCallback(() => {
    if (import.meta.env.DEV && (performance as any).memory) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize;
      
      // Only log memory issues in development
      if (memoryUsage > 50 * 1024 * 1024) { // 50MB threshold
        console.warn(`⚠️ High memory usage in ${componentName}: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        
        analytics.trackUserAction('performance_memory_warning', 'performance', {
          action: 'memory_warning',
          category: 'performance',
          label: componentName,
          metadata: {
            memoryUsage,
            type: 'memory_warning'
          }
        });
      }
      
      return memoryUsage;
    }
    return undefined;
  }, [componentName]);

  const startRender = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    renderCount.current += 1;
    const memoryUsage = trackMemoryUsage();
    
    metrics.current = {
      renderCount: renderCount.current,
      renderTime,
      memoryUsage
    };

    // Track excessive re-renders
    if (renderCount.current > 10 && renderCount.current % 5 === 0) {
      console.warn(`⚠️ Component "${componentName}" has rendered ${renderCount.current} times`);
      
      analytics.trackUserAction('performance_render_warning', 'performance', {
        action: 'excessive_renders',
        category: 'performance', 
        label: componentName,
        metadata: {
          renderCount: renderCount.current,
          type: 'render_warning'
        }
      });
    }

    // Track slow renders
    if (renderTime > 16 && import.meta.env.DEV) { // 16ms = 60fps threshold
      console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      
      analytics.trackUserAction('performance_slow_render', 'performance', {
        action: 'slow_render',
        category: 'performance',
        label: componentName,
        metadata: {
          renderTime,
          type: 'slow_render'
        }
      });
    }

    // Log performance metrics in development (less frequently)
    if (import.meta.env.DEV && renderCount.current % 20 === 0) {
      console.log(`🔍 Performance - ${componentName}:`, {
        renders: renderCount.current,
        lastRenderTime: `${renderTime.toFixed(2)}ms`,
        avgRenderTime: `${(metrics.current.renderTime).toFixed(2)}ms`,
        memoryUsage: memoryUsage ? 
          `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 
          'N/A'
      });
    }
  }, [componentName, trackMemoryUsage]);

  useEffect(() => {
    startRender();
    return endRender;
  });

  return metrics.current;
};

export const useWebVitals = () => {
  const vitalsReported = useRef(false);

  useEffect(() => {
    if (vitalsReported.current || !('PerformanceObserver' in window)) return;
    
    // Track Core Web Vitals
    const trackWebVitals = () => {
      try {
        // LCP - Largest Contentful Paint
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const lcp = entry.startTime;
            if (lcp > 2500) { // Poor LCP threshold
              console.warn(`⚠️ Poor LCP: ${lcp.toFixed(2)}ms`);
            }
            
            analytics.trackUserAction('web_vitals_lcp', 'performance', {
              action: 'lcp_measured',
              category: 'performance',
              label: 'core_web_vitals',
              metadata: {
                domContentLoaded: performance.timing.domContentLoaded,
                loadComplete: performance.timing.loadEventEnd,
                firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                largestContentfulPaint: lcp
              }
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS - Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          if (cls > 0.1) { // Poor CLS threshold
            console.warn(`⚠️ Poor CLS: ${cls.toFixed(3)}`);
            
            analytics.trackUserAction('web_vitals_cls', 'performance', {
              action: 'cls_measured',
              category: 'performance',
              label: 'core_web_vitals',
              metadata: {
                domContentLoaded: performance.timing.domContentLoaded,
                loadComplete: performance.timing.loadEventEnd,
                firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0
              }
            });
          }
        }).observe({ entryTypes: ['layout-shift'] });

        vitalsReported.current = true;
      } catch (error) {
        console.error('Error setting up web vitals tracking:', error);
        analytics.trackError(error instanceof Error ? error.message : 'Unknown web vitals error');
      }
    };

    // Delay tracking to avoid affecting initial load
    setTimeout(trackWebVitals, 1000);
  }, []);
};

export const useRenderOptimization = () => {
  const componentRefs = useRef(new Map<string, number>());

  const trackRender = useCallback((componentName: string) => {
    const current = componentRefs.current.get(componentName) || 0;
    componentRefs.current.set(componentName, current + 1);
    
    if (import.meta.env.DEV && current > 0 && current % 5 === 0) {
      console.warn(`⚠️  Component "${componentName}" has rendered ${current} times. Consider optimization.`);
    }
  }, []);

  return { trackRender };
};
