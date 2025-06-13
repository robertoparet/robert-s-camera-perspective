import { useCallback, useEffect, useState, useContext, useRef } from 'react';
import { getImages as getSupabaseImages, addImage as addSupabaseImage, deleteImage as deleteSupabaseImage } from '../services/supabase';
import { deleteCloudinaryImage } from '../services/cloudinary';
import type { Image } from '../types/image';
import { ImageContext } from '../context/context';

// Removido PAGE_SIZE para cargar todas las imágenes

export function useImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removido currentPage y totalImages ya que no usaremos paginación
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);  const fetchImages = useCallback(async () => {
    if (fetchInProgress.current) return;
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      // Cargar todas las imágenes sin paginación
      const { images: fetchedImages } = await getSupabaseImages();
      
      if (isMounted.current) {
        // Función de aleatorización más robusta (Fisher-Yates shuffle)
        const shuffleArray = (array: Image[]) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };
        
        const randomizedImages = fetchedImages ? shuffleArray(fetchedImages) : [];
        setImages(randomizedImages);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Error fetching images');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      fetchInProgress.current = false;
    }
  }, []); // Sin dependencias ya que no hay paginación

  useEffect(() => {
    isMounted.current = true;
    fetchImages();
    return () => {
      isMounted.current = false;
    };
  }, [fetchImages]);

  const addImage = useCallback(async (title: string, url: string) => {
    try {
      const newImage = await addSupabaseImage(title, url);
      if (isMounted.current) {
        await fetchImages(); // Refetch to get updated list
      }
      return newImage;
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Error adding image');
      }
      throw err;
    }
  }, [fetchImages]);

  const deleteImage = useCallback(async (id: string, publicId?: string) => {
    try {
      if (isMounted.current) {
        setLoading(true);
      }
      
      await deleteSupabaseImage(id);
      
      if (publicId) {
        await deleteCloudinaryImage(publicId);
      }
      
      if (isMounted.current) {
        await fetchImages();
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Error deleting image');
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchImages]);
  const refreshImages = useCallback(async () => {
    if (isMounted.current) {
      await fetchImages();
    }
  }, [fetchImages]);

  // Función para realeatorizar las imágenes existentes sin nueva consulta
  const shuffleImages = useCallback(() => {
    setImages(currentImages => {
      const shuffled = [...currentImages];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  return {
    images,
    loading,
    error,
    addImage,
    deleteImage,
    refreshImages,
    shuffleImages, // Nueva función para realeatorizar
  };
}