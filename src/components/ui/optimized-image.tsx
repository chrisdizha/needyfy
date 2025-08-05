import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage = memo(({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fallback = '/placeholder.svg',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || fallback);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  }, [fallback, onError]);

  // Generate responsive image URLs if needed
  const getOptimizedSrc = (originalSrc: string) => {
    // If it's already optimized or a placeholder, return as-is
    if (!originalSrc || originalSrc.includes('placeholder') || originalSrc.includes('data:')) {
      return originalSrc;
    }
    
    // For external URLs, return as-is (could be enhanced with image optimization service)
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    return originalSrc;
  };

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      
      <img
        src={getOptimizedSrc(imageSrc)}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'opacity-50'
        )}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };