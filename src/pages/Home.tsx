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
}) => (
  <div
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

export function Home() {  const context = useContext(ImageContext);
  const { 
    images = [], 
    loading = true, 
    albums = [], 
    filterByAlbum = () => {}, 
    currentAlbumId = null, 
    loadAlbums = () => {}, 
    coverImages = [],
    shuffleImages = () => {}
  } = context || {};const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'landing' | 'collection' | 'albums'>(() => {
    // Recuperar el viewMode guardado en localStorage, si no existe usar 'landing'
    const savedViewMode = localStorage.getItem('gallery-viewMode');
    return (savedViewMode as 'landing' | 'collection' | 'albums') || 'landing';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  // Guardar viewMode en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('gallery-viewMode', viewMode);
  }, [viewMode]);
  // Realeatorizar imágenes cuando se cambie a la vista de colección
  useEffect(() => {
    if (viewMode === 'collection' && images.length > 0) {
      shuffleImages();
    }
  }, [viewMode, images.length, shuffleImages]);

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
  // Cerrar menú móvil cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (mobileMenuOpen && !target.closest('.mobile-header-container')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

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
  }

  // Vista principal (landing) con diseño 50/50
  if (viewMode === 'landing') {
    return (
      <>        {/* Lado izquierdo - Foto */}
        <div className="fullscreen-photo-container">
          {/* Mostrar solo la imagen de portada seleccionada, no la primera imagen general */}
          {coverImages.length > 0 ? (
            <OptimizedImage
              src={coverImages[0].url}
              alt={coverImages[0].titulo}
              className="w-full h-full object-cover"
              quality="high"
              lazy={false}
            />
          ) : !loading ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-600 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No hay imagen de portada</p>
                <p className="text-gray-500 text-sm mt-2">Selecciona una imagen desde el panel de administración</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>

        {/* Lado derecho - Contenido */}
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
              </svg>
              @robertdev_
            </a>
          </div>
        </div>
      </>
    );
  }
  // Vista de la colección
  return (
    <div className="collection-view min-h-screen w-full overflow-x-hidden">      {/* Header móvil pegado al top - fuera del container principal */}
      <div className="mobile-header-container fixed top-0 left-0 right-0 z-50 flex md:hidden">
        <div className="mobile-header flex items-center justify-between w-full px-4 py-4 bg-white shadow-sm border-b border-gray-100">{/* Nombre Roberto Paret como enlace al inicio */}
          <button
            onClick={() => setViewMode('landing')}
            className="mobile-name-button text-lg font-bold text-gray-800 transition-colors duration-300"
          >
            Roberto Paret
          </button>
          
          {/* Botón del menú hamburger */}
          <div className="relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button p-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 bg-gray-50 rounded-lg"
              aria-label="Menú de navegación"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Menú desplegable */}
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setViewMode('landing');
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-menu-item w-full text-left px-4 py-3 text-sm transition-colors duration-300 text-gray-700 hover:bg-gray-50"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('collection');
                      filterByAlbum(null);
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-menu-item w-full text-left px-4 py-3 text-sm transition-colors duration-300 ${
                      viewMode === 'collection' && !currentAlbumId
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Colección
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('albums');
                      loadAlbums();
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-menu-item w-full text-left px-4 py-3 text-sm transition-colors duration-300 ${
                      viewMode === 'albums'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Álbumes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Contenido principal con padding-top para el header fijo */}
      <div className="gallery-container w-full pt-20 md:pt-8">
        {/* Header reorganizado: Desktop normal */}
        <div className="header-reorganized relative hidden md:flex items-center justify-between mb-8 mt-4 w-full">
          {/* Desktop Header - Home izquierda, Navegación derecha */}
          <div className="desktop-header flex items-center justify-between w-full">
            {/* Home - Izquierda (como texto simple) */}
            <button
              onClick={() => setViewMode('landing')}
              className="header-home-button home-text-button text-lg font-medium transition-colors duration-300 z-10"
            >
              Home
            </button>
            
            {/* Navegación - Derecha */}
            <div className="header-nav-buttons flex">
              <button
                onClick={() => {
                  setViewMode('collection');
                  filterByAlbum(null);
                }}
                className={`text-sm font-medium transition-all duration-300 ${
                  viewMode === 'collection' && !currentAlbumId
                    ? 'active'
                    : ''
                }`}
              >
                Todas las Fotos
              </button>
              <button
                onClick={() => {
                  setViewMode('albums');
                  loadAlbums();
                }}
                className={`text-sm font-medium transition-all duration-300 ${
                  viewMode === 'albums'
                    ? 'active'
                    : ''
                }`}
              >
                Álbumes
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'collection' ? (
          <>
            {currentAlbumId && (
              <div className="mb-6">
                <button
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
            )}            {/* Grid de imágenes con masonry - respeta proporciones originales */}
            <div className="masonry-grid">
              {images?.map((image, index) => (
                <div key={image.id} className="masonry-item">
                  <ImageCard
                    image={image}
                    index={index}
                    onImageClick={handleImageClick}
                  />
                </div>
              ))}

              {(!images || images.length === 0) && (
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
              
              return (
                <div
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
              );
            }) : (
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
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentImageIndex}
        slides={images?.map(img => ({ src: img.url, alt: img.titulo })) || []}
        plugins={[Zoom]}
        styles={{
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
        }}
        carousel={{
          spacing: 0
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonZoom: () => null,
          iconZoomIn: () => null
        }}
      />
    </div>
  );
}

export default Home;
