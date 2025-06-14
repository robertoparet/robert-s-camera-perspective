import { createContext } from 'react';
import { Image, Album } from '../types/image';

export interface ImageContextType {
  images: Image[];
  albums: Album[];
  coverImage: Image | null;
  coverImages: Image[];
  addImage: (title: string, url: string, albumId?: string) => Promise<Image>;
  deleteImage: (id: string) => Promise<void>;
  addAlbum: (nombre: string, descripcion?: string) => Promise<Album>;
  deleteAlbum: (id: string) => Promise<void>;
  updateImageAlbum: (imageId: string, albumId: string | null) => Promise<void>;
  updateImageTitle: (imageId: string, newTitle: string) => Promise<void>;
  updateAlbumName: (albumId: string, newName: string, newDescription?: string) => Promise<void>;
  setCoverImage: (imageId: string) => Promise<void>;
  removeCoverImage: (imageId: string) => Promise<void>;
  loadCoverImage: () => Promise<void>;
  loadCoverImages: () => Promise<void>;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalImages: number;  filterByAlbum: (albumId: string | null) => void;
  currentAlbumId: string | null;
  loadAlbums: () => Promise<void>;
  loadImages: (page?: number, albumId?: string | null) => Promise<void>;
  shuffleImages: () => void;
}

export const ImageContext = createContext<ImageContextType>({
  images: [],
  albums: [],
  coverImage: null,
  coverImages: [],
  addImage: async () => {
    throw new Error('Not implemented');
  },
  deleteImage: async () => {},
  addAlbum: async () => {
    throw new Error('Not implemented');
  },
  deleteAlbum: async () => {},
  updateImageAlbum: async () => {},
  updateImageTitle: async () => {},
  updateAlbumName: async () => {},
  setCoverImage: async () => {},
  removeCoverImage: async () => {},
  loadCoverImage: async () => {},
  loadCoverImages: async () => {},
  currentPage: 1,
  totalPages: 1,
  loading: false,
  setCurrentPage: () => {},
  pageSize: 12,
  totalImages: 0,
  filterByAlbum: () => {},
  currentAlbumId: null,  loadAlbums: async () => {
    throw new Error('Not implemented');
  },
  loadImages: async () => {
    throw new Error('Not implemented');
  },
  shuffleImages: () => {}
});