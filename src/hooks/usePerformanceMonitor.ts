
import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({ renderCount: 0, renderTime: 0 });

  const startRender = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    renderCount.current += 1;
    metrics.current = {
      renderCount: renderCount.current,
      renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    };

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development' && renderCount.current % 10 === 0) {
      console.log(`🔍 Performance - ${componentName}:`, {
        renders: renderCount.current,
        lastRenderTime: `${renderTime.toFixed(2)}ms`,
        memoryUsage: metrics.current.memoryUsage ? 
          `${(metrics.current.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 
          'N/A'
      });
    }
  }, [componentName]);

  useEffect(() => {
    startRender();
    return endRender;
  });

  return metrics.current;
};

export const useRenderOptimization = () => {
  const componentRefs = useRef(new Map<string, number>());

  const trackRender = useCallback((componentName: string) => {
    const current = componentRefs.current.get(componentName) || 0;
    componentRefs.current.set(componentName, current + 1);
    
    if (process.env.NODE_ENV === 'development' && current > 0 && current % 5 === 0) {
      console.warn(`⚠️  Component "${componentName}" has rendered ${current} times. Consider optimization.`);
    }
  }, []);

  return { trackRender };
};
