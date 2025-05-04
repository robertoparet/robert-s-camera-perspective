export interface Image {
  id: string;
  url: string;
  title: string;
  file?: File;
}

export interface ImageContextType {
  images: Image[];
  addImage: (image: Partial<Image>, file?: File) => void;
  deleteImage: (id: string) => void;
}