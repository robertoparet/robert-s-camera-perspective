import { createContext } from 'react';
import { ImageContextType } from '../types/image';

export const ImageContext = createContext<ImageContextType | undefined>(undefined);