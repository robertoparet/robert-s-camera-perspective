import { useCallback, useEffect, useState, useContext, useRef } from 'react';
import { getImages as getSupabaseImages, addImage as addSupabaseImage, deleteImage as deleteSupabaseImage } from '../services/supabase';
import { uploadImage, deleteCloudinaryImage } from '../services/cloudinary';
import type { Image } from '../types/image';
import { ImageContext } from '../context/context';

const PAGE_SIZE = 12;

export function useImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  const fetchImages = useCallback(async () => {
    if (fetchInProgress.current) return;
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      const { images: fetchedImages, totalCount } = await getSupabaseImages(currentPage);
      
      if (isMounted.current) {
        setImages(fetchedImages || []);
        setTotalImages(totalCount || 0);
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
  }, [currentPage]);

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

  const totalPages = Math.ceil(totalImages / PAGE_SIZE);

  return {
    images,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    pageSize: PAGE_SIZE,
    totalImages,
    addImage,
    deleteImage,
    refreshImages,
  };
}