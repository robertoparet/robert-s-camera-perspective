import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  imageLoadTime: number;
  memoryUsage: number;
  totalImages: number;
  cachedImages: number;
}

export function usePerformanceMonitor(imageCount: number) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    imageLoadTime: 0,
    memoryUsage: 0,
    totalImages: imageCount,
    cachedImages: 0
  });

  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const updateMetrics = () => {
      const now = performance.now();
      const renderTime = now - renderStartTime.current;
        // Estimate memory usage (rough calculation)
      const memoryUsage = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

      setMetrics(prev => ({
        ...prev,
        renderTime,
        memoryUsage: memoryUsage / 1024 / 1024, // Convert to MB
        totalImages: imageCount
      }));
    };

    updateMetrics();
    renderStartTime.current = performance.now();
  }, [imageCount]);

  return { metrics };
}

interface PerformanceDebuggerProps {
  metrics: PerformanceMetrics;
  visible?: boolean;
}

export function PerformanceDebugger({ metrics, visible = false }: PerformanceDebuggerProps) {
  // Only show in development and when visible
  if (import.meta.env.PROD || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-mono-900 text-mono-300 p-3 rounded-lg text-xs font-mono shadow-lg border border-mono-700 z-50">
      <div className="mb-2 text-mono-100 font-semibold">Performance Metrics</div>
      <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
      <div>Images: {metrics.totalImages}</div>
      <div>Cached: {metrics.cachedImages}</div>
      <div className="mt-2 text-mono-400 text-[10px]">Press Ctrl+M to toggle</div>
    </div>
  );
}
