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
  updateImageTitle as updateImageTitleInSupabase,
  updateAlbumName as updateAlbumNameInSupabase
} from '../services/supabase';

console.log('🆕 NEW FILE: ImageContext_NEW.tsx is executing!');

export function ImageProvider({ children }: { children: ReactNode }) {
  console.log('🆕 NEW ImageProvider starting...');
  
  const [images, setImages] = useState<Image[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const pageSize = 12;

  const loadAlbums = useCallback(async () => {
    try {
      console.log('🆕 NEW Loading albums...');
      const albumsData = await getAlbums();
      console.log('🆕 NEW Albums loaded:', albumsData?.length);
      setAlbums(albumsData);
    } catch (error) {
      console.error('Error loading albums:', error);
      setAlbums([]);
    }
  }, []);

  const loadImages = useCallback(async () => {
    if (loadingRef.current) return;
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
  }, [currentPage, pageSize, currentAlbumId]);

  useEffect(() => {
    loadAlbums();
    loadImages();
  }, [loadAlbums, loadImages]);

  const addImage = useCallback(async (title: string, url: string, albumId?: string) => {
    try {
      const newImage = await addImageToSupabase(title, url, albumId);
      await loadImages();
      return newImage;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  }, [loadImages]);

  const deleteImage = useCallback(async (id: string) => {
    try {
      await deleteImageFromSupabase(id);
      await loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }, [loadImages]);

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
      await loadImages();
    } catch (error) {
      console.error('Error updating image album:', error);
      throw error;
    }
  }, [loadImages]);

  // ⭐ CRITICAL: updateImageTitle function
  const updateImageTitle = useCallback(async (imageId: string, newTitle: string) => {
    console.log('⭐ NEW updateImageTitle called:', { imageId, newTitle });
    try {
      await updateImageTitleInSupabase(imageId, newTitle);
      await loadImages();
      console.log('⭐ NEW updateImageTitle completed successfully');
    } catch (error) {
      console.error('❌ NEW updateImageTitle error:', error);
      throw error;
    }
  }, [loadImages]);

  const updateAlbumName = useCallback(async (albumId: string, newName: string, newDescription?: string) => {
    try {
      await updateAlbumNameInSupabase(albumId, newName, newDescription);
      await loadAlbums();
    } catch (error) {
      console.error('Error updating album name:', error);
      throw error;
    }
  }, [loadAlbums]);

  const filterByAlbum = useCallback((albumId: string | null) => {
    setCurrentAlbumId(albumId);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(totalImages / pageSize);
  
  console.log('⭐ NEW updateImageTitle defined as:', typeof updateImageTitle);
  
  const contextValue = {
    images,
    albums,
    addImage,
    deleteImage,
    addAlbum,
    deleteAlbum,
    updateImageAlbum,
    updateImageTitle,
    updateAlbumName,
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
  
  console.log('⭐ NEW contextValue updateImageTitle:', typeof contextValue.updateImageTitle);

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}
