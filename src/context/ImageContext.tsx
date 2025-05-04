import { useState, ReactNode } from 'react';
import { Image } from '../types/image';
import { ImageContext } from './context';

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Image[]>([]);

  const addImage = (imageData: Partial<Image>, file?: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newImage: Image = {
        id: Date.now().toString(),
        title: imageData.title || file.name,
        url: imageUrl,
        file: file
      };
      setImages(prev => [...prev, newImage]);
    } else if (imageData.url) {
      const newImage: Image = {
        id: Date.now().toString(),
        title: imageData.title || 'Sin título',
        url: imageData.url
      };
      setImages(prev => [...prev, newImage]);
    }
  };

  const deleteImage = (id: string) => {
    setImages(prev => {
      const imageToDelete = prev.find(img => img.id === id);
      if (imageToDelete?.file) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  return (
    <ImageContext.Provider value={{ images, addImage, deleteImage }}>
      {children}
    </ImageContext.Provider>
  );
}