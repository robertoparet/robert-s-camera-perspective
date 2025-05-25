import { useContext, useCallback, memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { ImageContext } from '../context/context';
import type { Image } from '../types/image';

const ImageCard = memo(({ image, index, onImageClick }: { 
  image: Image; 
  index: number; 
  onImageClick: (index: number) => void;
}) => (
  <div
    className="group relative bg-mono-900 rounded-xl overflow-hidden shadow-lg transition-all duration-800 ease-smooth cursor-zoom-in hover:shadow-xl hover:-translate-y-1"
    onClick={() => onImageClick(index)}
  >
    <div className="relative overflow-hidden aspect-w-1 aspect-h-1">
      <img
        src={image.url}
        alt={image.titulo}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-800 ease-smooth group-hover:scale-102"
        loading="lazy"
      />
    </div>
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-mono-950 via-mono-900/80 to-transparent p-4 transform opacity-0 group-hover:opacity-100 transition-all duration-300">
      <h3 className="text-mono-100 text-lg font-medium truncate">
        {image.titulo}
      </h3>
    </div>
  </div>
));

export function Home() {
  const { images, loading, albums, filterByAlbum, currentAlbumId, loadAlbums } = useContext(ImageContext);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | 'albums'>('gallery');
  const navigate = useNavigate();
  
  // Force refresh of albums data when switching to albums view
  useEffect(() => {
    if (viewMode === 'albums') {
      loadAlbums();
    }
  }, [viewMode, loadAlbums]);
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && (event.code === 'Space' || event.code === 'Enter')) {
        event.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
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
  }  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-mono-100">
            Robert's Gallery
          </h1>

          <div className="flex rounded-lg overflow-hidden bg-mono-800">
            <button
              onClick={() => {
                setViewMode('gallery');
                filterByAlbum(null);
              }}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'gallery'
                  ? 'bg-purple-600 text-white'
                  : 'text-mono-300 hover:text-white hover:bg-mono-700'
              } transition-colors duration-300`}
            >
              Galería
            </button>
            <button
              onClick={() => {
                setViewMode('albums');
                loadAlbums(); // Force reload of albums when switching to albums view
              }}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'albums'
                  ? 'bg-purple-600 text-white'
                  : 'text-mono-300 hover:text-white hover:bg-mono-700'
              } transition-colors duration-300`}
            >
              Álbumes
            </button>
          </div>
        </div>

        {viewMode === 'gallery' ? (
          <>
            {currentAlbumId && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    filterByAlbum(null);
                    setViewMode('albums');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-mono-800 text-mono-300 rounded-lg hover:bg-mono-700 hover:text-white transition-colors duration-300"                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Volver a Álbumes
                </button>
              </div>
            )}
            
            <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-6 [column-fill:_balance] box-border min-h-[60vh]">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-2xl font-medium text-mono-300">
                    {currentAlbumId ? 'Este álbum está vacío' : 'No hay imágenes'}
                  </p>
                </div>
              )}            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {albums && albums.length > 0 ? albums.map(album => {
              // Calculate images for each album every time to ensure counts are correct
              const albumImages = images.filter(img => img.album_id === album.id);
              const coverImage = albumImages[0];
              
              return (
                <div
                  key={album.id}
                  onClick={() => {
                    filterByAlbum(album.id);
                    setViewMode('gallery');
                  }}
                  className="group cursor-pointer bg-mono-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-0"
                >
                  <div className="relative aspect-w-3 aspect-h-2 sm:aspect-w-1 sm:aspect-h-1">
                    {coverImage ? (
                      <img
                        src={coverImage.url}
                        alt={album.nombre}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-mono-700 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-mono-500"
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
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-mono-950 via-mono-900/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-mono-100">{album.nombre}</h3>
                    {album.descripcion && (
                      <p className="text-sm text-mono-400 mt-1">{album.descripcion}</p>
                    )}
                    <p className="text-sm text-mono-500 mt-2">
                      {albumImages.length} {albumImages.length === 1 ? 'imagen' : 'imágenes'}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full min-h-[60vh] flex flex-col items-center justify-center text-mono-400">
                <p className="text-2xl font-medium text-mono-300">
                  No hay álbumes
                </p>
                <button 
                  onClick={loadAlbums}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                  Recargar álbumes
                </button>
              </div>
            )}
          </div>
        )}
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