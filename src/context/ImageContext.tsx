import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Image } from '../types/image';
import { ImageContext } from './context';
import { addImage as addImageToSupabase, getImages, deleteImage as deleteImageFromSupabase } from '../services/supabase';

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Image[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const pageSize = 12;

  const loadImages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    try {
      setLoading(true);
      console.log('ImageProvider: Loading images...');
      const { images: fetchedImages, totalCount } = await getImages(currentPage, pageSize);
      console.log('ImageProvider: Raw fetched images:', fetchedImages);
      
      if (!Array.isArray(fetchedImages)) {
        console.error('ImageProvider: fetchedImages is not an array:', fetchedImages);
        return;
      }

      const validImages = fetchedImages.filter(img => {
        if (!img.url || !img.titulo) {
          console.error('ImageProvider: Invalid image data:', img);
          return false;
        }
        return true;
      });

      console.log('ImageProvider: Valid images to set:', validImages);
      setImages(validImages);
      setTotalImages(totalCount);
    } catch (error) {
      console.error('ImageProvider: Error loading images:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentPage, pageSize]);

  // Cargar imágenes inicialmente y cuando cambie la página
  useEffect(() => {
    console.log('ImageProvider: Effect triggered, loading images...');
    loadImages();
  }, [loadImages]);

  const addImage = useCallback(async (title: string, url: string) => {
    try {
      console.log('ImageProvider: Adding new image:', { title, url });
      const newImage = await addImageToSupabase(title, url);
      console.log('ImageProvider: New image added:', newImage);
      
      // Actualizar el estado inmediatamente
      setImages(prev => {
        console.log('ImageProvider: Updating images state with new image');
        return [newImage, ...prev];
      });
      setTotalImages(prev => prev + 1);
      return newImage;
    } catch (error) {
      console.error('ImageProvider: Error adding image:', error);
      throw error;
    }
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    try {
      await deleteImageFromSupabase(id);
      setImages(prev => prev.filter(img => img.id !== id));
      setTotalImages(prev => prev - 1);
    } catch (error) {
      console.error('ImageProvider: Error deleting image:', error);
      throw error;
    }
  }, []);

  const totalPages = Math.ceil(totalImages / pageSize);

  const contextValue = {
    images,
    addImage,
    deleteImage,
    currentPage,
    totalPages,
    loading,
    setCurrentPage,
    pageSize,
    totalImages
  };

  console.log('ImageProvider: Rendering with context value:', { 
    imagesCount: images.length,
    loading,
    currentPage,
    totalPages,
    totalImages 
  });

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}