
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImageLoader: React.FC<OptimizedImageLoaderProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 75,
  priority = false,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const getOptimizedImageUrl = useCallback((originalSrc: string) => {
    // For production, you would implement actual image optimization
    // This is a placeholder implementation
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    
    const paramString = params.toString();
    return paramString ? `${originalSrc}?${paramString}` : originalSrc;
  }, [width, height, quality]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, [priority]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimizedImageUrl(src);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, getOptimizedImageUrl]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const defaultPlaceholder = (
    <Skeleton 
      className={`${className} ${width ? `w-[${width}px]` : ''} ${height ? `h-[${height}px]` : ''}`}
      style={{ width, height }}
    />
  );

  const errorFallback = (
    <div 
      className={`${className} bg-gray-100 flex items-center justify-center text-gray-400 text-sm`}
      style={{ width, height }}
    >
      Failed to load image
    </div>
  );

  if (hasError) {
    return errorFallback;
  }

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={className}
        style={{ width, height }}
      >
        {placeholder || defaultPlaceholder}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (placeholder || defaultPlaceholder)}
      <img
        ref={imgRef}
        src={getOptimizedImageUrl(src)}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ width, height }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
};
