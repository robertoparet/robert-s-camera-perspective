import { createContext } from 'react';
import { Image } from '../types/image';

export interface ImageContextType {
  images: Image[];
  addImage: (title: string, url: string) => Promise<Image>;
  deleteImage: (id: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalImages: number;
}

export const ImageContext = createContext<ImageContextType>({
  images: [],
  addImage: async () => {
    throw new Error('Not implemented');
  },
  deleteImage: async () => {},
  currentPage: 1,
  totalPages: 1,
  loading: false,
  setCurrentPage: () => {},
  pageSize: 12,
  totalImages: 0,
});