import { useState, useRef } from 'react';
import { useImages } from '../hooks/useImages';
import { Link } from 'react-router-dom';
import { Image } from '../types/image';

export function AdminPanel() {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImage, images, deleteImage } = useImages();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      addImage({ title: title || selectedFile.name }, selectedFile);
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <div className="flex justify-between items-center mb-8">
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

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl mb-8">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Subir Nueva Imagen</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre de la imagen"
                />
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
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-300"
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

              <button
                type="submit"
                disabled={!selectedFile}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Subir Imagen
              </button>
            </form>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Imágenes en la Galería</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative bg-gray-700/50 rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(image)}
                      className="bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-700/80 transition-colors duration-300"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-white text-sm truncate">{image.title}</p>
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
      </div>
    </div>
  );
}