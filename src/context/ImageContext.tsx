import { useState, useEffect, ReactNode, useCallback, useRef, createContext } from 'react';
import { Image, Album } from '../types/image';
import type { ImageContextType } from './context';

import {
  addImage as addImageToSupabase,
  getImages,
  deleteImage as deleteImageFromSupabase,
  getAlbums,
  addAlbum as addAlbumToSupabase,
  deleteAlbum as deleteAlbumFromSupabase,
  updateImageAlbum as updateImageAlbumInSupabase,
  setCoverImage as setCoverImageInSupabase,
  getCoverImage as getCoverImageFromSupabase,
  getCoverImages as getCoverImagesFromSupabase,
  removeCoverImage as removeCoverImageFromSupabase,
  supabase
} from '../services/supabase';

export const ImageContext = createContext<ImageContextType | null>(null);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Image[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [coverImage, setCoverImageState] = useState<Image | null>(null);
  const [coverImages, setCoverImagesState] = useState<Image[]>([]);
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
      setAlbums([]);
    }
  }, []);
  const loadImages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    try {
      setLoading(true);      console.log('🔍 Loading ALL images with:', { currentAlbumId });
      const { images: fetchedImages, totalCount } = await getImages(currentAlbumId);
      
      console.log('📸 Fetched images:', { count: fetchedImages?.length, totalCount });
      
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
  }, [currentAlbumId]);const loadCoverImage = useCallback(async () => {
    try {
      const coverImg = await getCoverImageFromSupabase();
      setCoverImageState(coverImg);
    } catch (error) {
      console.error('Error loading cover image:', error);
      setCoverImageState(null);
    }
  }, []);
  const loadCoverImages = useCallback(async () => {
    try {
      const coverImgs = await getCoverImagesFromSupabase(3);
      setCoverImagesState(coverImgs);
    } catch (error) {
      console.error('Error loading cover images:', error);
      setCoverImagesState([]);
    }
  }, []);  useEffect(() => {
    console.log('🚀 ImageProvider useEffect triggered');
    console.log('📋 Starting data loading...');
    
    const loadData = async () => {
      try {
        console.log('📁 Loading albums...');
        await loadAlbums();
        
        // Cargar primero las imágenes de portada para evitar parpadeo
        console.log('📸 Loading cover images...');
        await loadCoverImages();
        
        console.log('🎯 Loading cover image...');
        await loadCoverImage();
        
        console.log('🖼️ Loading images...');
        await loadImages();
        
        console.log('✅ All data loading completed');
      } catch (error) {
        console.error('❌ Error during data loading:', error);
      }
    };
    
    loadData();
  }, [loadAlbums, loadImages, loadCoverImage, loadCoverImages]);

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
      await loadCoverImage(); // Reload cover image in case it was deleted
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }, [loadImages, loadCoverImage]);

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

  const updateImageTitle = useCallback(async (imageId: string, newTitle: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }      const { error } = await supabase
        .from('imagenes')
        .update({ titulo: newTitle })
        .eq('id', imageId);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      await loadImages();
    } catch (error) {
      console.error('❌ Error updating image title:', error);
      throw error;
    }
  }, [loadImages]);

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
  const setCoverImage = useCallback(async (imageId: string) => {
    try {
      await setCoverImageInSupabase(imageId);
      await loadCoverImage();
      await loadCoverImages();
      await loadImages(); // Reload to update UI state
    } catch (error) {
      console.error('Error setting cover image:', error);
      throw error;
    }
  }, [loadCoverImage, loadCoverImages, loadImages]);
  const removeCoverImage = useCallback(async (imageId: string) => {
    try {
      await removeCoverImageFromSupabase(imageId);
      await loadCoverImage();
      await loadCoverImages();
      await loadImages(); // Reload to update UI state
    } catch (error) {
      console.error('Error removing cover image:', error);
      throw error;
    }
  }, [loadCoverImage, loadCoverImages, loadImages]);

  const filterByAlbum = useCallback((albumId: string | null) => {
    setCurrentAlbumId(albumId);
    setCurrentPage(1);
  }, []);
  const totalPages = Math.ceil(totalImages / pageSize);
  
  // Debug logs
  console.log('ImageProvider Debug:', {
    imagesLength: images.length,
    coverImagesLength: coverImages.length,
    loading,
    albums: albums.length
  });
  
  const contextValue = {
    images,
    albums,
    coverImage,
    coverImages,
    addImage,
    deleteImage,
    addAlbum,
    deleteAlbum,
    updateImageAlbum,
    updateImageTitle,
    updateAlbumName,
    setCoverImage,
    removeCoverImage,
    loadCoverImage,
    loadCoverImages,
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

  // Debug log para ver qué se está pasando al contexto
  console.log('🔄 ImageContext providing:', {
    imagesCount: images.length,
    albumsCount: albums.length,
    coverImage: !!coverImage,
    coverImagesCount: coverImages.length,
    loading,
    currentPage,
    totalImages
  });

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}