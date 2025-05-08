import { useContext, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useState } from 'react';
import { ImageContext } from '../context/context';
import type { Image } from '../types/image';

const ImageCard = memo(({ image, index, onImageClick }: { 
  image: Image; 
  index: number; 
  onImageClick: (index: number) => void;
}) => {
  return (
    <div
      className="group relative bg-mono-900 rounded-xl overflow-hidden shadow-lg transition-all duration-800 ease-smooth cursor-zoom-in"
      onClick={() => onImageClick(index)}
    >
      <div className="relative overflow-hidden">
        <img
          src={image.url}
          alt={image.titulo}
          className="w-full h-auto object-cover transition-all duration-800 ease-smooth transform group-hover:scale-102"
          loading="lazy"
          onError={(e) => {
            console.error('Error loading image:', image.url);
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
          }}
          onLoad={(e) => {
            console.log('Image loaded successfully:', image.url);
            const target = e.currentTarget as HTMLImageElement;
            target.style.opacity = '1';
          }}
          style={{ opacity: 0, transition: 'opacity 0.8s ease-in-out' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-mono-950 via-mono-900/80 to-transparent p-4 transform transition-all duration-800 ease-smooth opacity-0 group-hover:opacity-100">
        <h3 className="text-mono-100 text-lg font-medium truncate">
          {image.titulo}
        </h3>
      </div>
    </div>
  );
});

export function Home() {
  const { images, loading } = useContext(ImageContext);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl + Space
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault(); // Prevent default browser behavior
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  console.log('Home rendering with images:', images?.length || 0, 'images');

  const handleImageClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-mono-100 mb-8">
          Robert's Gallery
        </h1>

        <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-6 [column-fill:_balance] box-border">
          {images?.map((image, index) => (
            <div key={image.id} className="break-inside-avoid mb-6">
              <ImageCard
                image={image}
                index={index}
                onImageClick={handleImageClick}
              />
            </div>
          ))}

          {(!images || images.length === 0) && (
            <div className="col-span-full min-h-[60vh] flex flex-col items-center justify-center text-mono-400">
              <svg
                className="w-24 h-24 mb-6 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-2xl font-medium text-mono-300">
                No images yet
              </p>
              <p className="text-base text-mono-500 mt-3">
                Press Ctrl + Space to access admin panel and add images
              </p>
            </div>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentImageIndex}
        slides={images?.map(img => ({ src: img.url, alt: img.titulo })) || []}
        plugins={[Zoom]}
        styles={{
          container: { backgroundColor: "rgba(10, 10, 10, 0.98)" },
          root: { "--yarl__color_backdrop": "rgba(10, 10, 10, 0.98)" }
        }}
        zoom={{
          maxZoomPixelRatio: 8,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true
        }}
        carousel={{
          padding: "0px",
          spacing: 0
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonZoom: () => null,
          iconZoomIn: () => null
        }}
      />
    </>
  );
}