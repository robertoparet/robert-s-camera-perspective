import { createContext } from 'react';
import { Image, Album } from '../types/image';

export interface ImageContextType {
  images: Image[];
  albums: Album[];
  addImage: (title: string, url: string, albumId?: string) => Promise<Image>;
  deleteImage: (id: string) => Promise<void>;
  addAlbum: (nombre: string, descripcion?: string) => Promise<Album>;
  deleteAlbum: (id: string) => Promise<void>;
  updateImageAlbum: (imageId: string, albumId: string | null) => Promise<void>;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalImages: number;
  filterByAlbum: (albumId: string | null) => void;
  currentAlbumId: string | null;
}

export const ImageContext = createContext<ImageContextType>({
  images: [],
  albums: [],
  addImage: async () => {
    throw new Error('Not implemented');
  },
  deleteImage: async () => {},
  addAlbum: async () => {
    throw new Error('Not implemented');
  },
  deleteAlbum: async () => {},
  updateImageAlbum: async () => {},
  currentPage: 1,
  totalPages: 1,
  loading: false,
  setCurrentPage: () => {},
  pageSize: 12,
  totalImages: 0,
  filterByAlbum: () => {},
  currentAlbumId: null
});