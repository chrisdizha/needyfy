
import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdvancedPerformanceMonitor } from '@/hooks/useAdvancedPerformanceMonitor';

interface LazyLoadWrapperProps {
  componentImport: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  componentName: string;
  props?: any;
}

const DefaultSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const ErrorFallback = ({ componentName }: { componentName: string }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-medium">Failed to load {componentName}</h3>
    <p className="text-red-600 text-sm mt-1">Please refresh the page to try again.</p>
  </div>
);

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  componentImport,
  fallback = <DefaultSkeleton />,
  errorFallback,
  componentName,
  props = {}
}) => {
  const { trackRenderStart, trackRenderEnd } = useAdvancedPerformanceMonitor(`LazyLoad-${componentName}`);
  
  const LazyComponent = lazy(() => {
    trackRenderStart();
    return componentImport().finally(() => {
      trackRenderEnd();
    });
  });

  const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      const handleError = () => setHasError(true);
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
      return errorFallback || <ErrorFallback componentName={componentName} />;
    }

    return <>{children}</>;
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
