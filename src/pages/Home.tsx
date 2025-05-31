import { useContext, useCallback, memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { ImageContext } from '../context/ImageContext';
import { OptimizedImage } from '../components/OptimizedImage';
import type { Image } from '../types/image';

const ImageCard = memo(({ image, index, onImageClick }: { 
  image: Image; 
  index: number; 
  onImageClick: (index: number) => void;
}) => (  <div
    className="group relative bg-gray-800 overflow-hidden shadow-lg transition-all duration-800 ease-smooth cursor-zoom-in hover:shadow-xl hover:-translate-y-1"
    onClick={() => onImageClick(index)}
  >
    <div className="relative overflow-hidden">
      <OptimizedImage
        src={image.url}
        alt={image.titulo}
        className="w-full h-auto object-cover transition-all duration-800 ease-smooth group-hover:scale-102"
        quality="medium"
        lazy={true}
      />
    </div>
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800/80 to-transparent p-4 transform opacity-0 group-hover:opacity-100 transition-all duration-300">
      <h3 className="text-white text-lg font-medium truncate">
        {image.titulo}
      </h3>
    </div>
  </div>
));

export function Home() {
  const context = useContext(ImageContext);
  const { 
    images = [], 
    loading = true, 
    albums = [], 
    filterByAlbum = () => {}, 
    currentAlbumId = null, 
    loadAlbums = () => {}, 
    coverImages = [] 
  } = context || {};  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'landing' | 'collection' | 'albums'>('landing');
  const navigate = useNavigate();

  // Debug logs
  useEffect(() => {
    console.log('🏠 Home component mounted/updated:', {
      context: !!context,
      imagesCount: images?.length || 0,
      coverImagesCount: coverImages?.length || 0,
      loading,
      viewMode,
      albumsCount: albums?.length || 0
    });
    
    if (images?.length > 0) {
      console.log('🖼️ First image in Home:', images[0]);
    }
    
    if (coverImages?.length > 0) {
      console.log('📷 Cover images in Home:', coverImages);
    }
  }, [context, images, coverImages, loading, viewMode, albums]);
  // Debug logs
  console.log('Home Component Debug:', {
    context: !!context,
    images: images?.length || 0,
    coverImages: coverImages?.length || 0,
    loading,
    viewMode
  });

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
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }  // Vista principal (landing) con diseño 50/50
  if (viewMode === 'landing') {    return (
      <>
        {/* Lado izquierdo - Foto */}        <div className="fullscreen-photo-container">
          {/* Mostrar imagen de portada (solo una) o la primera imagen disponible */}
          {(coverImages.length > 0 || images.length > 0) ? (
            <OptimizedImage
              src={coverImages.length > 0 ? coverImages[0].url : images[0].url}
              alt={coverImages.length > 0 ? coverImages[0].titulo : images[0].titulo}
              className="w-full h-full object-cover"
              quality="high"
              lazy={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <p className="text-gray-600">Cargando imágenes...</p>
            </div>
          )}
        </div>{/* Lado derecho - Contenido */}
        <div className="content-container">
          <div className="text-center max-w-md">
            <h1>Roberto Paret</h1>
            <p>Colección Fotográfica</p>
            
            {/* Botón principal de entrada */}
            <button
              onClick={() => setViewMode('collection')}
              className="gallery-button mb-6"
            >
              Ver Colección
            </button>

            {/* Enlace a Instagram */}
            <a
              href="https://instagram.com/robertdev_"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-button"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>              @robertdev_
            </a>
          </div>
        </div>
      </>
    );
  }

  // Vista de la colección
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('landing')}
              className="text-2xl font-bold text-white hover:text-purple-400 transition-colors duration-300"
            >
              Roberto Paret
            </button>            <span className="text-gray-400">•</span>
            <h2 className="text-xl text-gray-300">Colección</h2>
          </div>          <div className="flex gap-2">
            {/* Botón de retorno al inicio */}
            <button
              onClick={() => setViewMode('landing')}
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Volver al Inicio
            </button>
            
            {/* Navegación principal reordenada */}
            <div className="flex overflow-hidden bg-gray-700">
              <button
                onClick={() => {
                  setViewMode('collection');
                  filterByAlbum(null);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'collection'
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                } transition-colors duration-300`}
              >
                Todas las Fotos
              </button>
              <button
                onClick={() => {
                  setViewMode('albums');
                  loadAlbums();
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'albums'
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                } transition-colors duration-300`}
              >
                Álbumes
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'collection' ? (
          <>
            {currentAlbumId && (
              <div className="mb-6">                <button
                  onClick={() => {
                    filterByAlbum(null);
                    setViewMode('albums');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-300"
                >
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

            {/* Grid de imágenes */}
            <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-6 [column-fill:_balance] box-border min-h-[60vh]">
              {images?.map((image, index) => (
                <div key={image.id} className="break-inside-avoid mb-6">
                  <ImageCard
                    image={image}
                    index={index}
                    onImageClick={handleImageClick}
                  />
                </div>
              ))}              {(!images || images.length === 0) && (
                <div className="col-span-full min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
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
                  <p className="text-2xl font-medium text-gray-300">
                    {currentAlbumId ? 'Este álbum está vacío' : 'No hay imágenes'}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Vista de álbumes
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {albums && albums.length > 0 ? albums.map(album => {
              const albumImages = images.filter(img => img.album_id === album.id);
              const coverImage = albumImages[0];
              
              return (                <div
                  key={album.id}
                  onClick={() => {
                    filterByAlbum(album.id);
                    setViewMode('collection');
                  }}
                  className="group cursor-pointer bg-white border border-gray-200 overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 p-0"
                >
                  <div className="relative w-full h-64 overflow-hidden">
                    {coverImage ? (
                      <OptimizedImage
                        src={coverImage.url}
                        alt={album.nombre}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        quality="medium"
                        lazy={true}
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
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
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-medium text-gray-900">{album.nombre}</h3>
                    {album.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{album.descripcion}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {albumImages.length} {albumImages.length === 1 ? 'imagen' : 'imágenes'}
                    </p>
                  </div>
                </div>
              );            }) : (
              <div className="col-span-full min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <p className="text-2xl font-medium text-gray-600">
                  No hay álbumes
                </p>
                <button 
                  onClick={loadAlbums}
                  className="mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-sm transition-colors"
                >
                  Recargar álbumes
                </button>
              </div>
            )}
          </div>
        )}
      </div>      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentImageIndex}
        slides={images?.map(img => ({ src: img.url, alt: img.titulo })) || []}
        plugins={[Zoom]}        styles={{
          container: { backgroundColor: "rgba(255, 255, 255, 0.3)" },
          root: { "--yarl__color_backdrop": "rgba(255, 255, 255, 0.3)" }
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.25,
          doubleTapDelay: 300,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 200,
          pinchZoomDistanceFactor: 300,
          scrollToZoom: true
        }}        carousel={{
          spacing: 0
        }}render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonZoom: () => null,
          iconZoomIn: () => null
        }}
      />
    </>
  );
}

export default Home;
