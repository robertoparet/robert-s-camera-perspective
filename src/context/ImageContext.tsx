import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Image, Album } from '../types/image';
import { ImageContext } from './context';
import {
  addImage as addImageToSupabase,
  getImages,
  deleteImage as deleteImageFromSupabase,
  getAlbums,
  addAlbum as addAlbumToSupabase,
  deleteAlbum as deleteAlbumFromSupabase,
  updateImageAlbum as updateImageAlbumInSupabase,
  supabase
} from '../services/supabase';

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Image[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingRef = useRef(false);
  const pageSize = 12;  const loadAlbums = useCallback(async () => {
    try {
      const albumsData = await getAlbums();
      setAlbums(albumsData || []);
    } catch (error) {
      console.error('Error loading albums:', error);
      setAlbums([]);
    }
  }, []);

  const loadImages = useCallback(async (page = 1, albumId: string | null = null) => {
    if (loadingRef.current) return;    loadingRef.current = true;
    
    try {
      setLoading(true);
      const { images: fetchedImages, totalCount } = await getImages(page, pageSize, albumId);
      
      if (!Array.isArray(fetchedImages)) {
        console.error('ImageProvider: fetchedImages is not an array:', fetchedImages);
        return;
      }

      setImages(fetchedImages);
      setTotalImages(totalCount);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);
  // Initial load effect - loads both albums and images on mount
  useEffect(() => {
    const initialLoad = async () => {      if (loadingRef.current) return;
      loadingRef.current = true;
      
      setLoading(true);
      
      try {
        // Load albums and images in parallel for better performance
        const [albumsData, imagesData] = await Promise.all([
          getAlbums(),
          getImages(1, pageSize, null)
        ]);
        
        setAlbums(albumsData || []);
        setImages(imagesData?.images || []);
        setTotalImages(imagesData?.totalCount || 0);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error in initial load:', error);
        // Set empty arrays as fallback
        setAlbums([]);
        setImages([]);
        setTotalImages(0);
        setIsInitialized(true);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    
    initialLoad();
  }, []); // Empty dependency array for initial load only  // Listen for auth state changes to reload albums when user authenticates
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: unknown) => {
      console.log('Auth state changed:', event, !!session);
        // Reload albums when user signs in or out
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await loadAlbums();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [loadAlbums]);
  
  // Effect for when page or album filter changes (only after initialization)
  useEffect(() => {
    const loadImagesForChanges = async () => {
      if (!isInitialized || loadingRef.current) return;
      if (currentPage === 1 && currentAlbumId === null) return; // Skip initial state
        loadingRef.current = true;
      
      try {
        setLoading(true);
        const { images: fetchedImages, totalCount } = await getImages(currentPage, pageSize, currentAlbumId);
        
        if (!Array.isArray(fetchedImages)) {
          console.error('ImageProvider: fetchedImages is not an array:', fetchedImages);
          return;
        }

        setImages(fetchedImages);
        setTotalImages(totalCount);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadImagesForChanges();
  }, [currentPage, currentAlbumId, isInitialized]);

  const addImage = useCallback(async (title: string, url: string, albumId?: string) => {
    try {
      const newImage = await addImageToSupabase(title, url, albumId);
      // Reload images to ensure consistency
      await loadImages(currentPage, currentAlbumId);
      return newImage;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  }, [currentPage, currentAlbumId, loadImages]);

  const deleteImage = useCallback(async (id: string) => {
    try {
      await deleteImageFromSupabase(id);
      // Reload images to ensure consistency
      await loadImages(currentPage, currentAlbumId);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }, [currentPage, currentAlbumId, loadImages]);

  const addAlbum = useCallback(async (nombre: string, descripcion?: string) => {
    try {
      const newAlbum = await addAlbumToSupabase(nombre, descripcion);
      await loadAlbums();
      return newAlbum;
    } catch (error) {
      console.error('Error adding album:', error);
      throw error;
    }
  }, [loadAlbums]);

  const deleteAlbum = useCallback(async (id: string) => {
    try {
      await deleteAlbumFromSupabase(id);
      await loadAlbums();
      if (currentAlbumId === id) {
        setCurrentAlbumId(null);
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  }, [loadAlbums, currentAlbumId]);

  const updateImageAlbum = useCallback(async (imageId: string, albumId: string | null) => {
    try {
      await updateImageAlbumInSupabase(imageId, albumId);
      // Reload images to ensure consistency
      await loadImages(currentPage, currentAlbumId);
    } catch (error) {
      console.error('Error updating image album:', error);
      throw error;
    }
  }, [currentPage, currentAlbumId, loadImages]);

  const filterByAlbum = useCallback((albumId: string | null) => {
    setCurrentAlbumId(albumId);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(totalImages / pageSize);
  
  const contextValue = {
    images,
    albums,
    addImage,
    deleteImage,
    addAlbum,
    deleteAlbum,
    updateImageAlbum,
    currentPage,
    totalPages,
    loading,
    setCurrentPage,
    pageSize,
    totalImages,
    filterByAlbum,
    currentAlbumId,
    loadAlbums,
    loadImages
  };

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}