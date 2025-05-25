import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export interface GalleryImage {
  id: string;
  url: string;
  titulo: string;
  fecha_subida: string;
  album_id?: string | null;
  user_id: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getImages(page = 1, pageSize = 12, albumId?: string | null) {
  try {
    const from = (page - 1) * pageSize;
    
    let query = supabase
      .from('imagenes')
      .select('*', { count: 'exact' });

    if (albumId) {
      query = query.eq('album_id', albumId);
    }

    const { data, count, error } = await query
      .order('fecha_subida', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Fetched images:', { count, imageCount: data?.length });
    return {
      images: data || [],
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error in getImages:', error);
    throw error;
  }
}

export async function addImage(title: string, url: string, albumId?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const { data, error } = await supabase
    .from('imagenes')
    .insert([{ 
      titulo: title, 
      url: url,
      fecha_subida: new Date().toISOString(),
      album_id: albumId || null,
      user_id: session.user.id
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding image to Supabase:', error);
    throw error;
  }
  return data as GalleryImage;
}

export async function deleteImage(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const { error } = await supabase
    .from('imagenes')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

export async function getAlbums() {
  try {
    const { data, error } = await supabase
      .from('albumes')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
    
    console.log('Fetched albums:', data?.length);
    return data || [];
  } catch (error) {
    console.error('Error in getAlbums:', error);
    return [];
  }
}

export async function addAlbum(nombre: string, descripcion?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const { data, error } = await supabase
    .from('albumes')
    .insert([{
      nombre,
      descripcion,
      fecha_creacion: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding album:', error);
    throw error;
  }
  return data;
}

export async function deleteAlbum(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  // Primero actualizar las imágenes que pertenecen a este álbum
  const { error: updateError } = await supabase
    .from('imagenes')
    .update({ album_id: null })
    .eq('album_id', id);

  if (updateError) throw updateError;

  // Luego eliminar el álbum
  const { error } = await supabase
    .from('albumes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateImageAlbum(imageId: string, albumId: string | null) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const { error } = await supabase
    .from('imagenes')
    .update({ album_id: albumId })
    .eq('id', imageId);

  if (error) throw error;
}