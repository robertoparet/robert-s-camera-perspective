import { useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ImageContext } from '../context/context';
import { uploadImage } from '../services/cloudinary';
import type { Image } from '../types/image';

type AdminView = 'upload' | 'classification';

export function AdminPanel() {
  const [currentView, setCurrentView] = useState<AdminView>('upload');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    addImage, 
    images, 
    deleteImage, 
    albums, 
    addAlbum, 
    deleteAlbum, 
    updateImageAlbum 
  } = useContext(ImageContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      console.log('Starting image upload to Cloudinary...');
      const cloudinaryResult = await uploadImage(selectedFile);
      console.log('Cloudinary upload successful:', cloudinaryResult);
      
      console.log('Adding image to Supabase...');
      await addImage(title || selectedFile.name, cloudinaryResult.url, selectedAlbum || undefined);
      console.log('Image successfully added to Supabase');
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with navigation */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Panel de Administración
            </h2>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
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
              Volver a la Galería
            </Link>
          </div>

          {/* View selector */}
          <div className="flex rounded-lg overflow-hidden bg-gray-800/30 p-1">
            <button
              onClick={() => setCurrentView('upload')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                currentView === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              } transition-colors duration-300`}
            >
              Subir Imágenes
            </button>
            <button
              onClick={() => setCurrentView('classification')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                currentView === 'classification'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              } transition-colors duration-300`}
            >
              Clasificación
            </button>
          </div>
        </div>

        {currentView === 'upload' ? (
          <>
            {/* Image upload section */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl mb-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Subir Nueva Imagen</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                      placeholder="Título de la imagen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Álbum
                    </label>
                    <select
                      value={selectedAlbum}
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="">Sin álbum</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center"
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
                        className="px-6 py-3 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 transition-colors"
                      >
                        Seleccionar Imagen
                      </button>
                      {selectedFile && (
                        <div className="text-sm text-gray-300">
                          Imagen seleccionada: {selectedFile.name}
                        </div>
                      )}
                      <p className="text-gray-400">o arrastra y suelta una imagen aquí</p>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                  </button>
                </form>
              </div>
            </div>

            {/* Gallery section */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Imágenes en la Galería</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div 
                      key={image.id} 
                      className="group relative bg-gray-700/50 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={image.url}
                          alt={image.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleDelete(image)}
                            className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/40 backdrop-blur-sm rounded-lg">
                          <h4 className="text-white text-sm font-medium mb-2">
                            {image.titulo}
                          </h4>
                          <select
                            value={image.album_id || ''}
                            onChange={(e) => handleImageAlbumUpdate(image.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-gray-800 text-white rounded-md border border-gray-600"
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
                  ))}
                  {images.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      No hay imágenes en la galería
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Album management */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Gestión de Álbumes</h3>
                <form onSubmit={handleAddAlbum} className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Nombre del álbum"
                      className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={newAlbumDescription}
                      onChange={(e) => setNewAlbumDescription(e.target.value)}
                      placeholder="Descripción (opcional)"
                      className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 transition-colors"
                    >
                      Añadir Álbum
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 gap-4">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="bg-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium text-lg">{album.nombre}</h4>
                          {album.descripcion && (
                            <p className="text-gray-400 text-sm mt-1">{album.descripcion}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteAlbum(album.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
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
                              className="relative group aspect-square rounded-lg overflow-hidden"
                            >
                              <img
                                src={image.url}
                                alt={image.titulo}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={() => handleImageAlbumUpdate(image.id, null)}
                                  className="p-1 bg-red-600/80 text-white rounded-md hover:bg-red-700/80 transition-colors text-sm"
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
            </div>

            {/* Unclassified images */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Imágenes sin clasificar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images
                    .filter(img => !img.album_id)
                    .map(image => (
                      <div
                        key={image.id}
                        className="relative group aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={image.titulo}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                          <p className="text-white text-sm mb-2 text-center">
                            {image.titulo}
                          </p>
                          <select
                            value=""
                            onChange={(e) => handleImageAlbumUpdate(image.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-gray-800 text-white rounded-md border border-gray-600"
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
                  }
                  {images.filter(img => !img.album_id).length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
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