import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
  size?: number;
}

interface ImageCacheOptions {
  maxSize?: number; // Tamaño máximo del cache en MB
  maxAge?: number; // Edad máxima en milisegundos
  preloadCount?: number; // Número de imágenes a precargar
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize = 50, maxAge = 30 * 60 * 1000) { // 50MB, 30 minutos
    this.maxSize = maxSize * 1024 * 1024; // Convertir a bytes
    this.maxAge = maxAge;
  }

  async set(url: string): Promise<void> {
    try {
      // Verificar si ya está en cache
      if (this.cache.has(url)) {
        const entry = this.cache.get(url)!;
        entry.timestamp = Date.now(); // Actualizar timestamp
        return;
      }

      // Precargar la imagen
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Estimar el tamaño (aproximado)
      const estimatedSize = this.estimateImageSize(url, img.width, img.height);

      // Limpiar cache si es necesario
      this.cleanup();

      // Agregar al cache
      this.cache.set(url, {
        url,
        timestamp: Date.now(),
        size: estimatedSize
      });

    } catch (error) {
      console.warn('Error caching image:', url, error);
    }
  }

  get(url: string): CacheEntry | null {
    const entry = this.cache.get(url);
    
    if (!entry) return null;

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(url);
      return null;
    }

    // Actualizar timestamp
    entry.timestamp = Date.now();
    return entry;
  }

  has(url: string): boolean {
    return this.get(url) !== null;
  }

  private cleanup(): void {
    const now = Date.now();
    let currentSize = 0;

    // Eliminar entradas expiradas
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(url);
      } else {
        currentSize += entry.size || 0;
      }
    }

    // Si excede el tamaño máximo, eliminar las más antiguas
    if (currentSize > this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      for (const [url, entry] of entries) {
        this.cache.delete(url);
        currentSize -= entry.size || 0;
        if (currentSize <= this.maxSize * 0.8) break; // Dejar un 20% de margen
      }
    }
  }

  private estimateImageSize(url: string, width: number, height: number): number {
    // Estimación muy básica del tamaño de la imagen
    const pixels = width * height;
    let bytesPerPixel = 3; // RGB

    // Ajustar según el tipo de imagen
    if (url.includes('.jpg') || url.includes('.jpeg')) {
      bytesPerPixel = 1.5; // JPEG tiene compresión
    } else if (url.includes('.png')) {
      bytesPerPixel = 4; // PNG con alpha
    } else if (url.includes('.webp')) {
      bytesPerPixel = 1.2; // WebP es muy eficiente
    }

    return pixels * bytesPerPixel;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; count: number; items: CacheEntry[] } {
    const items = Array.from(this.cache.values());
    const size = items.reduce((total, item) => total + (item.size || 0), 0);
    
    return {
      size,
      count: items.length,
      items
    };
  }
}

// Instancia global del cache
const globalImageCache = new ImageCache();

export function useImageCache(options: ImageCacheOptions = {}) {
  const { preloadCount = 5 } = options;
  const [cacheStats, setCacheStats] = useState(globalImageCache.getStats());

  const preloadImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      await globalImageCache.set(url);
      setCacheStats(globalImageCache.getStats());
      return true;
    } catch {
      return false;
    }
  }, []);

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    const uniqueUrls = [...new Set(urls)].filter(url => !globalImageCache.has(url));
    
    // Procesar en lotes para no saturar la red
    for (let i = 0; i < uniqueUrls.length; i += preloadCount) {
      const batch = uniqueUrls.slice(i, i + preloadCount);
      await Promise.allSettled(batch.map(url => preloadImage(url)));
      
      // Pequeña pausa entre lotes
      if (i + preloadCount < uniqueUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [preloadImage, preloadCount]);

  const isImageCached = useCallback((url: string): boolean => {
    return globalImageCache.has(url);
  }, []);

  const clearCache = useCallback(() => {
    globalImageCache.clear();
    setCacheStats(globalImageCache.getStats());
  }, []);

  // Actualizar stats periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(globalImageCache.getStats());
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    preloadImage,
    preloadImages,
    isImageCached,
    clearCache,
    cacheStats
  };
}

// Hook específico para precargar imágenes de una galería
export function useGalleryImageCache(images: string[], currentIndex: number) {
  const { preloadImages, isImageCached, cacheStats } = useImageCache();
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadSurroundingImages = useCallback(async () => {
    if (isPreloading || images.length === 0) return;

    setIsPreloading(true);
    
    try {
      // Precargar imagen actual y las siguientes/anteriores
      const range = 3; // Precargar 3 imágenes antes y después
      const start = Math.max(0, currentIndex - range);
      const end = Math.min(images.length, currentIndex + range + 1);
      
      const imagesToPreload = images.slice(start, end);
      await preloadImages(imagesToPreload);
    } finally {
      setIsPreloading(false);
    }
  }, [images, currentIndex, preloadImages, isPreloading]);

  useEffect(() => {
    preloadSurroundingImages();
  }, [preloadSurroundingImages]);

  return {
    isPreloading,
    isImageCached,
    cacheStats,
    preloadSurroundingImages
  };
}