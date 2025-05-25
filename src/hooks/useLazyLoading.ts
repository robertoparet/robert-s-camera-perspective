import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useLazyLoading(options: UseLazyLoadingOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((element: HTMLElement | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    
    elementRef.current = element;
    
    if (element && !hasTriggered) {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    }
  }, [hasTriggered]);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      // Fallback para navegadores que no soportan IntersectionObserver
      setIsIntersecting(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && triggerOnce) {
          setHasTriggered(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce]);

  return {
    ref: setRef,
    isIntersecting,
    hasTriggered
  };
}

// Hook específico para imágenes
export function useImageLazyLoading() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isIntersecting } = useLazyLoading();

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const reset = useCallback(() => {
    setIsLoaded(false);
    setHasError(false);
  }, []);

  return {
    ref,
    isIntersecting,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    reset
  };
}

// Hook para cargar imágenes en lotes
export function useBatchImageLoading(images: string[], batchSize = 5) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextBatch = useCallback(async () => {
    if (isLoading || currentBatch * batchSize >= images.length) return;

    setIsLoading(true);
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, images.length);
    const batch = images.slice(start, end);

    const loadPromises = batch.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    });

    try {
      const loadedBatch = await Promise.allSettled(loadPromises);
      const successfullyLoaded = loadedBatch
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);

      setLoadedImages(prev => new Set([...prev, ...successfullyLoaded]));
      setCurrentBatch(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [images, batchSize, currentBatch, isLoading]);

  useEffect(() => {
    if (images.length > 0 && currentBatch === 0) {
      loadNextBatch();
    }
  }, [images.length, currentBatch, loadNextBatch]);

  return {
    loadedImages,
    isLoading,
    loadNextBatch,
    hasMore: currentBatch * batchSize < images.length,
    progress: Math.min((currentBatch * batchSize) / images.length, 1)
  };
}