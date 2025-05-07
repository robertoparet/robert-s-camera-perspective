export interface Image {
  id: string;
  url: string;
  titulo: string;
  fecha_subida: string;
  file?: File;
  publicId?: string;
}

export interface ImageContextType {
  images: Image[];
  addImage: (title: string, url: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
}