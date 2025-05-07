import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImages } from '../hooks/useImages';
import { uploadImage } from '../services/cloudinary';
import { signOut } from '../services/supabase';
import type { Image } from '../types/image';

export function Admin() {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImage, images, deleteImage } = useImages();
  const navigate = useNavigate();

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
      await addImage(title || selectedFile.name, cloudinaryResult.url);
      console.log('Image successfully added to Supabase');
      
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to upload image');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: Image) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(image.id);
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 relative z-50">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          
          {/* Botones para escritorio */}
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
            >
              Volver a la Galería
            </button>
            <button
              onClick={() => signOut().then(() => navigate('/login'))}
              className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors duration-300"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Menú móvil */}
          <div className="md:hidden relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/50 transition-colors duration-300"
            >
              Menu
            </button>
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-transparent" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800/90 backdrop-blur-sm ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200"
                      role="menuitem"
                    >
                      Volver a la Galería
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut().then(() => navigate('/login'));
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 transition-colors duration-200"
                      role="menuitem"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative z-0">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl mb-8">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Upload New Image</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Image title"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600/80 file:text-white hover:file:bg-purple-700/80 file:transition-colors file:duration-300"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Gallery Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div 
                    key={image.id} 
                    className="group relative bg-gray-700/50 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-w-4 aspect-h-3">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                      <h4 className="text-white text-sm font-medium mb-4 text-center">
                        {image.titulo}
                      </h4>
                      <button
                        onClick={() => handleDelete(image)}
                        className="bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-700/80 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No images in the gallery
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}