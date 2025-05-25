import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  imageCount: number;
  cacheHitRate: number;
  averageImageLoadTime: number;
}

interface UsePerformanceMonitorResult {
  metrics: PerformanceMetrics;
  recordImageLoad: (loadTime: number) => void;
  recordCacheHit: () => void;
  recordCacheMiss: () => void;
}

export function usePerformanceMonitor(imageCount: number = 0): UsePerformanceMonitorResult {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    imageCount,
    cacheHitRate: 0,
    averageImageLoadTime: 0,
  });

  const startTime = useRef<number>(Date.now());
  const imageLoadTimes = useRef<number[]>([]);
  const cacheHits = useRef<number>(0);
  const cacheMisses = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      imageCount,
      loadTime: Date.now() - startTime.current,
    }));
  }, [imageCount]);

  const recordImageLoad = (loadTime: number) => {
    imageLoadTimes.current.push(loadTime);
    const averageLoadTime = imageLoadTimes.current.reduce((sum, time) => sum + time, 0) / imageLoadTimes.current.length;
    
    setMetrics(prev => ({
      ...prev,
      averageImageLoadTime: averageLoadTime,
    }));
  };

  const recordCacheHit = () => {
    cacheHits.current++;
    updateCacheHitRate();
  };

  const recordCacheMiss = () => {
    cacheMisses.current++;
    updateCacheHitRate();
  };

  const updateCacheHitRate = () => {
    const totalRequests = cacheHits.current + cacheMisses.current;
    const hitRate = totalRequests > 0 ? (cacheHits.current / totalRequests) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate,
    }));
  };

  return {
    metrics,
    recordImageLoad,
    recordCacheHit,
    recordCacheMiss,
  };
}

// Performance monitoring component for debugging
export function PerformanceDebugger({ metrics }: { metrics: PerformanceMetrics }) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-mono-900 text-mono-100 p-4 rounded-lg shadow-lg text-sm font-mono max-w-xs z-50">
      <h3 className="font-bold mb-2 text-purple-400">Performance Metrics</h3>
      <div className="space-y-1">
        <div>Load Time: {(metrics.loadTime / 1000).toFixed(2)}s</div>
        <div>Images: {metrics.imageCount}</div>
        <div>Cache Hit Rate: {metrics.cacheHitRate.toFixed(1)}%</div>
        <div>Avg Load Time: {metrics.averageImageLoadTime.toFixed(0)}ms</div>
      </div>
    </div>
  );
}
