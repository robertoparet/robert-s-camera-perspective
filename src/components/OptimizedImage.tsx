import { useState, useRef, useEffect, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: 'low' | 'medium' | 'high';
  onClick?: () => void;
  lazy?: boolean;
}

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  quality = 'medium',
  onClick,
  lazy = true 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generar URLs optimizadas para Cloudinary si es aplicable
  const getOptimizedUrl = (originalUrl: string, quality: 'low' | 'medium' | 'high') => {
    // Si es una URL de Cloudinary, agregar parámetros de optimización
    if (originalUrl.includes('cloudinary.com')) {
      const qualityMap = {
        low: 'q_30,f_auto,w_400',
        medium: 'q_70,f_auto,w_800',
        high: 'q_90,f_auto,w_1200'
      };
      
      // Insertar parámetros antes del nombre del archivo
      const parts = originalUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/${qualityMap[quality]}/${parts[1]}`;
      }
    }
    
    return originalUrl;
  };

  // Progressive loading: cargar calidad baja primero, luego alta
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      try {
        // Primero cargar imagen de baja calidad si no estamos en calidad low
        if (quality !== 'low') {
          const lowQualityUrl = getOptimizedUrl(src, 'low');
          setCurrentSrc(lowQualityUrl);
          
          // Crear imagen temporal para cargar la de alta calidad
          const highQualityImg = new Image();
          highQualityImg.onload = () => {
            setCurrentSrc(getOptimizedUrl(src, quality));
            setIsLoaded(true);
          };
          highQualityImg.onerror = () => setHasError(true);
          highQualityImg.src = getOptimizedUrl(src, quality);
        } else {
          setCurrentSrc(getOptimizedUrl(src, quality));
        }      } catch {
        setHasError(true);
      }
    };

    loadImage();
  }, [isInView, src, quality]);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px' // Cargar cuando esté 50px antes de entrar en viewport
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <svg
          className="w-12 h-12 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>      {/* Placeholder mientras carga */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-20" />
          ) : (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 animate-spin" />
          )}
        </div>
      )}
      
      {/* Imagen principal */}
      <img
        ref={imgRef}
        src={currentSrc || undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          if (quality === 'low' || currentSrc === getOptimizedUrl(src, quality)) {
            setIsLoaded(true);
          }
        }}
        onError={() => setHasError(true)}
        loading={lazy ? 'lazy' : 'eager'}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };
export default OptimizedImage;