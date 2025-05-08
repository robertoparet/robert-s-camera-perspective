export interface Album {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_creacion: string;
  user_id: string;
}

export interface Image {
  id: string;
  url: string;
  titulo: string;
  fecha_subida: string;
  file?: File;
  publicId?: string;
  album_id?: string;
  user_id: string;
}

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