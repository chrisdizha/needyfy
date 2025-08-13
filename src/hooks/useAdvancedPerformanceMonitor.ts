
import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  apiLatency: number;
  errorRate: number;
  userInteractions: number;
}

interface PerformanceThresholds {
  renderTime: number;
  memoryUsage: number;
  apiLatency: number;
}

export const useAdvancedPerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    apiLatency: 0,
    errorRate: 0,
    userInteractions: 0
  });

  const renderStartTime = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const errorCount = useRef<number>(0);
  const totalRequests = useRef<number>(0);

  const thresholds: PerformanceThresholds = {
    renderTime: 100, // ms
    memoryUsage: 50, // MB
    apiLatency: 1000 // ms
  };

  // Track render performance
  const trackRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const trackRenderEnd = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
      
      if (renderTime > thresholds.renderTime) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [componentName, thresholds.renderTime]);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
      
      if (memoryUsage > thresholds.memoryUsage) {
        console.warn(`High memory usage in ${componentName}: ${memoryUsage.toFixed(2)}MB`);
      }
    }
  }, [componentName, thresholds.memoryUsage]);

  // Track API performance
  const trackApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    totalRequests.current++;
    
    try {
      const result = await apiCall();
      const latency = performance.now() - startTime;
      
      setMetrics(prev => ({ ...prev, apiLatency: latency }));
      
      if (latency > thresholds.apiLatency) {
        console.warn(`Slow API call to ${endpoint}: ${latency.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      errorCount.current++;
      const errorRate = (errorCount.current / totalRequests.current) * 100;
      setMetrics(prev => ({ ...prev, errorRate }));
      
      console.error(`API error in ${componentName} (${endpoint}):`, error);
      throw error;
    }
  }, [componentName, thresholds.apiLatency]);

  // Track user interactions
  const trackInteraction = useCallback((interactionType: string) => {
    interactionCount.current++;
    setMetrics(prev => ({ 
      ...prev, 
      userInteractions: interactionCount.current 
    }));
    
    // Log significant interaction patterns
    if (interactionCount.current % 10 === 0) {
      console.log(`${componentName}: ${interactionCount.current} user interactions`);
    }
  }, [componentName]);

  // Performance monitoring setup
  useEffect(() => {
    trackRenderStart();
    
    const memoryInterval = setInterval(trackMemoryUsage, 5000);
    
    // Cleanup
    return () => {
      trackRenderEnd();
      clearInterval(memoryInterval);
    };
  }, [trackRenderStart, trackRenderEnd, trackMemoryUsage]);

  // Performance alerts
  useEffect(() => {
    const criticalThresholds = {
      renderTime: 500,
      memoryUsage: 100,
      apiLatency: 3000,
      errorRate: 10
    };

    if (metrics.renderTime > criticalThresholds.renderTime) {
      toast.error(`Critical: Slow rendering in ${componentName}`);
    }
    
    if (metrics.memoryUsage > criticalThresholds.memoryUsage) {
      toast.error(`Critical: High memory usage in ${componentName}`);
    }
    
    if (metrics.errorRate > criticalThresholds.errorRate) {
      toast.error(`Critical: High error rate in ${componentName}`);
    }
  }, [metrics, componentName]);

  return {
    metrics,
    trackApiCall,
    trackInteraction,
    trackRenderStart,
    trackRenderEnd
  };
};
