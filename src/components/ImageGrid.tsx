import { useImages } from '../hooks/useImages';
import { Image } from '../types/image';
import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

export function ImageGrid() {
  const { images } = useImages();
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {images.map((image: Image, index: number) => (
            <div 
              key={image.id} 
              className="group relative bg-gray-800/30 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
              onClick={() => {
                setPhotoIndex(index);
                setOpen(true);
              }}
            >
              <div className="relative pt-[100%]">
                <img
                  src={image.url}
                  alt={image.title}
                  className="absolute inset-0 w-full h-full object-contain bg-black/20"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 translate-y-0">
                <h3 className="text-white text-lg font-medium truncate">{image.title}</h3>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full min-h-[60vh] flex flex-col items-center justify-center text-white/80">
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
              <p className="text-2xl font-medium bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                No hay imágenes en la galería
              </p>
              <p className="text-base opacity-60 mt-3">
                Las imágenes que agregues aparecerán aquí con un hermoso diseño
              </p>
            </div>
          )}
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={photoIndex}
        slides={images.map(img => ({ src: img.url }))}
        plugins={[Zoom]}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .95)" },
          root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .95)" }
        }}
        zoom={{
          maxZoomPixelRatio: 5,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          scrollToZoom: true
        }}
        render={{
          iconZoomIn: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          ),
          iconZoomOut: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM5 10h8" />
            </svg>
          )
        }}
      />
    </>
  );
}