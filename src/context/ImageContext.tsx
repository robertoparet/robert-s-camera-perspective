import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Image, Album } from '../types/image';
import { ImageContext } from './context';

console.log('🚨 CRITICAL: ImageContext.tsx file is being executed!');
console.log('🚨 CRITICAL: This should appear if our file is running!');

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
  console.log('🚀 [INIT] ImageProvider loading...');
  
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
      console.log('🔥🔥🔥 NUEVOS ALBUMES CARGANDO - ARCHIVO CORRECTO 🔥🔥🔥');
      const albumsData = await getAlbums();
      console.log('Albums loaded:', albumsData?.length);
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
      return newAlbum;    } catch (error) {
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
      }    } catch (error) {
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
  const updateImageTitle = useCallback(async (imageId: string, newTitle: string) => {
    console.log('🔧 [NEW] updateImageTitle function called with:', { imageId, newTitle });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }

      const { data, error } = await supabase
        .from('imagenes')
        .update({ titulo: newTitle })
        .eq('id', imageId)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Image title updated successfully:', data);
      await loadImages();
    } catch (error) {
      console.error('❌ [NEW] Error updating image title:', error);
      throw error;
    }
  }, [loadImages]);

  // Debug: Check updateImageTitle function after definition
  console.log('🔧 [NEW] updateImageTitle defined:', {
    typeof: typeof updateImageTitle,
    function: updateImageTitle,
    isFunction: typeof updateImageTitle === 'function'
  });
  const updateAlbumName = useCallback(async (albumId: string, newName: string, newDescription?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }

      const updateData: { nombre: string; descripcion?: string } = { nombre: newName };
      if (newDescription !== undefined) {
        updateData.descripcion = newDescription;
      }

      const { error } = await supabase
        .from('albumes')
        .update(updateData)
        .eq('id', albumId);

      if (error) throw error;
      
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
  
  // Debug: Check all functions before creating contextValue
  console.log('🔧 [NEW] Before contextValue creation:', {
    updateImageTitle: typeof updateImageTitle,
    updateImageTitleFunction: updateImageTitle,
    updateImageAlbum: typeof updateImageAlbum,
    addImage: typeof addImage,
    deleteImage: typeof deleteImage
  });
  
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
    loadImages  };
  
  // ⚡ FINAL CHECK: Log exactly what's in contextValue
  console.log('⚡ FINAL contextValue check:', {
    hasUpdateImageTitle: 'updateImageTitle' in contextValue,
    updateImageTitleType: typeof contextValue.updateImageTitle,
    updateImageTitleValue: contextValue.updateImageTitle,
    allKeys: Object.keys(contextValue)
  });

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}