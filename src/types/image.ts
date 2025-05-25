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
  album_id?: string | null;
  user_id?: string;
}