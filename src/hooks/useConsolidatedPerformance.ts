import { useEffect, useRef, useCallback, useMemo } from 'react';
import { trackError, trackPerformanceEvent } from '@/lib/optimizedAnalytics';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  memoryUsage?: number;
  averageRenderTime: number;
}

interface ConsolidatedPerformanceOptions {
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
  logThreshold?: number;
  batchSize?: number;
}

// Global performance state to reduce overhead
const performanceState = {
  renderTimes: new Map<string, number[]>(),
  lastLogTime: new Map<string, number>(),
  errorCounts: new Map<string, number>(),
};

// Throttled logging to prevent performance impact
const throttledLog = (() => {
  const logQueue: Array<{ component: string; data: any }> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  return (component: string, data: any) => {
    logQueue.push({ component, data });
    
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        // Batch process logs
        const grouped = logQueue.reduce((acc, item) => {
          if (!acc[item.component]) acc[item.component] = [];
          acc[item.component].push(item.data);
          return acc;
        }, {} as Record<string, any[]>);

        Object.entries(grouped).forEach(([component, logs]) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 Performance Batch - ${component}:`, {
              logCount: logs.length,
              lastMetrics: logs[logs.length - 1]
            });
          }
        });

        logQueue.length = 0;
        timeoutId = null;
      }, 2000); // Batch logs every 2 seconds
    }
  };
})();

export const useConsolidatedPerformance = (
  componentName: string,
  options: ConsolidatedPerformanceOptions = {}
) => {
  const {
    enableMemoryTracking = false,
    enableRenderTracking = true,
    logThreshold = 10,
    batchSize = 5
  } = options;

  const renderCount = useRef(0);
  const startTime = useRef<number>(0);
  const lastLogTime = useRef<number>(0);
  const observers = useRef<PerformanceObserver[]>([]);

  // Memoized metrics calculation
  const metrics = useMemo((): PerformanceMetrics => {
    const times = performanceState.renderTimes.get(componentName) || [];
    const averageRenderTime = times.length > 0 
      ? times.reduce((sum, time) => sum + time, 0) / times.length 
      : 0;

    return {
      renderCount: renderCount.current,
      lastRenderTime: times[times.length - 1] || 0,
      memoryUsage: enableMemoryTracking ? (performance as any).memory?.usedJSHeapSize : undefined,
      averageRenderTime
    };
  }, [componentName, enableMemoryTracking, renderCount.current]);

  // Optimized render tracking
  const trackRender = useCallback(() => {
    if (!enableRenderTracking) return;

    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    renderCount.current += 1;

    // Store render times efficiently
    if (!performanceState.renderTimes.has(componentName)) {
      performanceState.renderTimes.set(componentName, []);
    }
    
    const times = performanceState.renderTimes.get(componentName)!;
    times.push(renderTime);
    
    // Keep only last 10 render times to prevent memory leaks
    if (times.length > 10) {
      times.shift();
    }

    // Throttled logging
    const now = Date.now();
    const lastLog = performanceState.lastLogTime.get(componentName) || 0;
    
    if (now - lastLog > 5000 && renderCount.current % logThreshold === 0) {
      performanceState.lastLogTime.set(componentName, now);
      
      throttledLog(componentName, {
        renders: renderCount.current,
        avgRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
        lastRenderTime: `${renderTime.toFixed(2)}ms`,
        memoryUsage: metrics.memoryUsage ? 
          `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 
          'N/A'
      });

      // Track slow renders with optimized analytics
      if (renderTime > 16) { // 16ms = 60fps threshold
        trackPerformanceEvent(componentName, 'slow_render', renderTime);
      }

      // Track average render time periodically
      if (renderCount.current % 10 === 0) {
        trackPerformanceEvent(componentName, 'avg_render_time', metrics.averageRenderTime);
      }
    }
  }, [componentName, enableRenderTracking, logThreshold, metrics]);

  // Track component errors
  const trackComponentError = useCallback((error: Error, errorInfo?: any) => {
    const currentCount = performanceState.errorCounts.get(componentName) || 0;
    performanceState.errorCounts.set(componentName, currentCount + 1);

    trackError(error, {
      component: componentName,
      errorCount: currentCount + 1,
      renderCount: renderCount.current,
      ...errorInfo
    });
  }, [componentName]);

  // Initialize performance observers with proper cleanup
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      // Track long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            throttledLog(componentName, {
              type: 'long-task',
              duration: `${entry.duration.toFixed(2)}ms`,
              startTime: entry.startTime
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
      observers.current.push(longTaskObserver);

      // Track layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.value > 0.1) { // Significant layout shift
            throttledLog(componentName, {
              type: 'layout-shift',
              value: entry.value,
              hadRecentInput: entry.hadRecentInput
            });
          }
        });
      });

      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      observers.current.push(layoutShiftObserver);

    } catch (error) {
      // Silently handle unsupported browsers
      console.warn('Performance observers not fully supported:', error);
    }

    return () => {
      observers.current.forEach(observer => {
        try {
          observer.disconnect();
        } catch (error) {
          // Ignore cleanup errors
        }
      });
      observers.current = [];
    };
  }, [componentName]);

  // Start render measurement
  useEffect(() => {
    startTime.current = performance.now();
    return trackRender;
  });

  return {
    metrics,
    trackError: trackComponentError,
    isSlowRender: metrics.lastRenderTime > 16,
    hasFrequentErrors: (performanceState.errorCounts.get(componentName) || 0) > 3
  };
};

// Hook for component render optimization
export const useRenderOptimization = () => {
  const trackComponent = useCallback((componentName: string) => {
    const current = performanceState.renderTimes.get(componentName)?.length || 0;
    
    if (current > 0 && current % 5 === 0) {
      throttledLog(componentName, {
        type: 'frequent-renders',
        renderCount: current,
        suggestion: 'Consider memoization or state optimization'
      });
    }
  }, []);

  return { trackComponent };
};
