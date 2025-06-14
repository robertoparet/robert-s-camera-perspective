import { useImages } from '../hooks/useImages';
import { Image } from '../types/image';
import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

export function ImageGrid() {
  const { images, loading } = useImages();
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 min-h-[60vh]">
          {loading ? (
            // Loading skeletons
            [...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="relative pt-[100%] bg-gray-800/50"></div>
              </div>
            ))
          ) : images.length > 0 ? (
            images.map((image: Image, index: number) => (
              <div 
                key={image.id} 
                className="group relative bg-gray-800/30 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                onClick={() => {
                  setPhotoIndex(index);
                  setOpen(true);
                }}
              >
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.titulo}
                    className="w-full h-auto object-contain bg-black/20"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 translate-y-0">
                  <h3 className="text-white text-lg font-medium truncate">{image.titulo}</h3>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No images found
            </div>
          )}        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={photoIndex}
        slides={images.map(img => ({ src: img.url, alt: img.titulo }))}        plugins={[Zoom]}        styles={{
          container: { backgroundColor: "rgba(255, 255, 255, 0.3)" },
          root: { "--yarl__color_backdrop": "rgba(255, 255, 255, 0.3)" }
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.25,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          wheelZoomDistanceFactor: 200,
          pinchZoomDistanceFactor: 300,
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