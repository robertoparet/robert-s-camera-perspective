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
  updateImageAlbum as updateImageAlbumInSupabase
} from '../services/supabase';

export function ImageProvider({ children }: { children: ReactNode }) {
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
      const albumsData = await getAlbums();
      setAlbums(albumsData);
    } catch (error) {
      console.error('Error loading albums:', error);
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
    currentAlbumId
  };

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}