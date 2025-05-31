import { useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ImageContext } from '../context/ImageContext';
import { uploadImage } from '../services/cloudinary';
import type { Image } from '../types/image';

type AdminView = 'upload' | 'classification';

export function AdminPanel() {
  const [currentView, setCurrentView] = useState<AdminView>('upload');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');  // Edit states for images
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Edit states for albums
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editAlbumDescription, setEditAlbumDescription] = useState('');  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextValue = useContext(ImageContext);

  const { 
    addImage = async () => {}, 
    images = [], 
    deleteImage = async () => {}, 
    albums = [], 
    addAlbum = async () => {}, 
    deleteAlbum = async () => {}, 
    updateImageAlbum = async () => {},
    updateAlbumName = async () => {},
    setCoverImage = async () => {},
    removeCoverImage = async () => {},
    coverImages = []
  } = contextValue || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;    try {
      setUploading(true);
      setError('');
      const cloudinaryResult = await uploadImage(selectedFile);
      
      await addImage(title || selectedFile.name, cloudinaryResult.url, selectedAlbum || undefined);
      
      setTitle('');
      setSelectedFile(null);
      setSelectedAlbum('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleAddAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      await addAlbum(newAlbumName, newAlbumDescription);
      setNewAlbumName('');
      setNewAlbumDescription('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear el álbum');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este álbum?')) {
      try {
        await deleteAlbum(albumId);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al eliminar el álbum');
      }    }
  };
  const handleImageAlbumUpdate = async (imageId: string, albumId: string | null) => {
    try {
      await updateImageAlbum(imageId, albumId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el álbum de la imagen');
    }
  };
  // Album editing functions
  const handleEditAlbum = (album: { id: string; nombre: string; descripcion?: string }) => {
    setEditingAlbumId(album.id);
    setEditAlbumName(album.nombre);
    setEditAlbumDescription(album.descripcion || '');
  };
  const handleSaveAlbumName = async (albumId: string) => {
    // Confirmación antes de guardar
    const shouldSave = window.confirm(
      `¿Estás seguro de que quieres guardar los cambios en el álbum?\n\nNombre: "${editAlbumName}"\nDescripción: "${editAlbumDescription}"`
    );
    
    if (!shouldSave) {
      return;
    }
    
    if (!updateAlbumName) {
      console.error('❌ updateAlbumName function not available in context');
      setError('La función de actualización de álbumes no está disponible');
      return;
    }
      try {
      const updateFn = contextValue?.updateAlbumName || updateAlbumName;
      await updateFn(albumId, editAlbumName, editAlbumDescription);
      
      // Reset edit state
      setEditingAlbumId(null);
      setEditAlbumName('');
      setEditAlbumDescription('');
      setError('');
    } catch (error) {
      console.error('❌ Error updating album:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el álbum');
    }
  };

  const handleCancelAlbumEdit = () => {
    setEditingAlbumId(null);
    setEditAlbumName('');
    setEditAlbumDescription('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDelete = (image: Image) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      deleteImage(image.id);
    }
  };

  // Check if image is cover image
  const isImageCover = (imageId: string) => {
    return coverImages.some(img => img.id === imageId);
  };
  // Handle cover image selection with limit
  const handleCoverImageToggle = async (imageId: string) => {
    const isCover = isImageCover(imageId);
    
    if (isCover) {
      // Remove from cover images
      await removeCoverImage(imageId);
    } else {
      // Check if we already have 1 cover image (only one allowed)
      if (coverImages.length >= 1) {
        alert('Solo puedes tener una imagen de portada. Quita la actual antes de seleccionar otra.');
        return;
      }
      // Add to cover images
      await setCoverImage(imageId);
    }
  };

  // Edit handlers
  const handleEditImage = (image: Image) => {
    setEditingImageId(image.id);
    setEditTitle(image.titulo);
  };  const handleSaveImageTitle = async () => {
    if (!editingImageId || !editTitle.trim()) return;
    
    // Confirmación antes de guardar
    if (!confirm('¿Estás seguro de que quieres guardar estos cambios en el título?')) return;
      try {
      // Use the function directly from context to avoid any destructuring issues
      const updateFn = contextValue?.updateImageTitle;
      if (typeof updateFn !== 'function') {
        console.error('❌ updateImageTitle is not a function:', updateFn);
        throw new Error(`updateImageTitle is not a function, it's ${typeof updateFn}`);
      }
      
      await updateFn(editingImageId, editTitle.trim());
      setEditingImageId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating image title:', error);
      setError('Error al actualizar el título de la imagen');
    }
  };

  const handleCancelEdit = () => {
    setEditingImageId(null);
    setEditTitle('');
  };
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header with navigation */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Panel de Administración
            </h2>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 backdrop-blur-sm text-white hover:bg-gray-700 transition-colors duration-300"
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
              Volver a la Colección
            </Link>
          </div>          {/* View selector */}
          <div className="flex overflow-hidden bg-gray-200 p-1">
            <button
              onClick={() => setCurrentView('upload')}              className={`flex-1 px-4 py-2 text-sm font-medium ${
                currentView === 'upload'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
              } transition-colors duration-300`}
            >
              Subir Imágenes
            </button>            <button
              onClick={() => setCurrentView('classification')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                currentView === 'classification'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
              } transition-colors duration-300`}
            >
              Clasificación
            </button>
          </div>
        </div>

        {currentView === 'upload' ? (
          <>            {/* Image upload section */}
            <div className="bg-gray-200 overflow-hidden shadow-xl mb-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Subir Nueva Imagen</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      placeholder="Título de la imagen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Álbum
                    </label>
                    <select
                      value={selectedAlbum}
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="">Sin álbum</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.nombre}
                        </option>
                      ))}
                    </select>
                  </div>                  <div 
                    className="border-2 border-dashed border-gray-400 p-8 text-center bg-gray-50"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                      >
                        Seleccionar Imagen
                      </button>
                      {selectedFile && (
                        <div className="text-sm text-gray-600">
                          Imagen seleccionada: {selectedFile.name}
                        </div>
                      )}
                      <p className="text-gray-500">o arrastra y suelta una imagen aquí</p>
                    </div>
                  </div>                  {error && (
                    <p className="text-red-700 text-sm bg-red-100 px-4 py-2 border border-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="w-full bg-gray-700 text-white py-2 px-4 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                  </button>
                </form>
              </div>
            </div>            {/* Gallery section */}
            <div className="bg-gray-200 overflow-hidden shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Imágenes en la Colección</h3>                  <div className="bg-gray-300 px-3 py-1 border border-gray-400">
                    <span className="text-gray-700 text-sm font-medium">
                      Portada: {coverImages.length > 0 ? '✓ Seleccionada' : 'No seleccionada'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (                    <div 
                      key={image.id} 
                      className="group relative bg-gray-100 overflow-hidden"
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={image.url}
                          alt={image.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">                        <div className="absolute top-2 right-2 flex gap-2">
                          {/* BOTÓN DE FOTO DE PORTADA */}
                          {isImageCover(image.id) ? (                            <button
                              onClick={() => handleCoverImageToggle(image.id)}
                              className="p-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                              title="Quitar imagen de portada"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </button>
                          ) : (                            <button
                              onClick={() => handleCoverImageToggle(image.id)}
                              className="p-2 bg-gray-600 text-white hover:bg-yellow-600 transition-colors"
                              title="Establecer como imagen de portada"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          )}
                          {/* BOTÓN DE EDITAR */}                          <button
                            onClick={() => handleEditImage(image)}
                            className="p-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                            title="Editar título"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* BOTÓN DE ELIMINAR */}                          <button
                            onClick={() => handleDelete(image)}
                            className="p-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div><div className="absolute bottom-2 left-2 right-2 p-2 bg-black/40 backdrop-blur-sm">
                          {editingImageId === image.id ? (
                            <div className="space-y-2">                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                placeholder="Título de la imagen"
                                autoFocus
                              />
                              <div className="flex gap-1 justify-end">                                <button
                                  onClick={handleSaveImageTitle}
                                  className="px-2 py-1 bg-green-600 text-white hover:bg-green-700 transition-colors text-xs"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-xs"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <h4 className="text-white text-sm font-medium mb-2">
                              {image.titulo}
                            </h4>
                          )}                          <select
                            value={image.album_id || ''}
                            onChange={(e) => handleImageAlbumUpdate(image.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-gray-200 text-gray-800 border border-gray-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Sin álbum</option>
                            {albums.map((album) => (
                              <option key={album.id} value={album.id}>
                                {album.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}                  {images.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No hay imágenes en la colección
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">            {/* Album management */}
            <div className="bg-gray-200 overflow-hidden shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestión de Álbumes</h3>
                <form onSubmit={handleAddAlbum} className="space-y-4 mb-6">
                  <div className="flex gap-4">                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Nombre del álbum"
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={newAlbumDescription}
                      onChange={(e) => setNewAlbumDescription(e.target.value)}
                      placeholder="Descripción (opcional)"
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                    >
                      Añadir Álbum
                    </button>
                  </div>
                </form><div className="grid grid-cols-1 gap-4">
                  {albums.map((album) => (                    <div
                      key={album.id}
                      className="bg-gray-100 p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          {editingAlbumId === album.id ? (
                            <div className="space-y-3">                              <input
                                type="text"
                                value={editAlbumName}
                                onChange={(e) => setEditAlbumName(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
                                placeholder="Nombre del álbum"
                                autoFocus
                              />
                              <textarea
                                value={editAlbumDescription}
                                onChange={(e) => setEditAlbumDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:border-gray-400 focus:outline-none resize-none"
                                placeholder="Descripción (opcional)"
                                rows={2}
                              />
                              <div className="flex gap-2">                                <button
                                  onClick={() => handleSaveAlbumName(album.id)}
                                  className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Guardar
                                </button>
                                <button
                                  onClick={handleCancelAlbumEdit}
                                  className="px-3 py-1 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (                            <div>
                              <h4 className="text-gray-800 font-medium text-lg">{album.nombre}</h4>
                              {album.descripcion && (
                                <p className="text-gray-600 text-sm mt-1">{album.descripcion}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingAlbumId !== album.id && (                            <button
                              onClick={() => handleEditAlbum(album)}
                              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                              title="Editar álbum"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}                          <button
                            onClick={() => handleDeleteAlbum(album.id)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            title="Eliminar álbum"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                        {/* Images in this album */}
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {images
                          .filter(img => img.album_id === album.id)
                          .map(image => (
                            <div
                              key={image.id}
                              className="relative group aspect-square overflow-hidden"
                            >
                              <img
                                src={image.url}
                                alt={image.titulo}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">                                <button
                                  onClick={() => handleImageAlbumUpdate(image.id, null)}
                                  className="p-1 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>            {/* Unclassified images */}
            <div className="bg-gray-200 overflow-hidden shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Imágenes sin clasificar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images
                    .filter(img => !img.album_id)
                    .map(image => (                      <div
                        key={image.id}
                        className="relative group aspect-square overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={image.titulo}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                          <p className="text-white text-sm mb-2 text-center">
                            {image.titulo}
                          </p>                          <select
                            value=""
                            onChange={(e) => handleImageAlbumUpdate(image.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-gray-200 text-gray-800 border border-gray-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="" disabled>Seleccionar álbum</option>
                            {albums.map((album) => (
                              <option key={album.id} value={album.id}>
                                {album.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  }                  {images.filter(img => !img.album_id).length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No hay imágenes sin clasificar
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}