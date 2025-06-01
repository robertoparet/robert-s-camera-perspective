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
  user_id?: string;
  is_covered?: boolean;
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

export async function getImages(albumId?: string | null) {
  try {
    console.log('🔍 getImages called - loading ALL images:', { albumId });
    
    let query = supabase
      .from('imagenes')
      .select('*', { count: 'exact' });

    if (albumId) {
      query = query.eq('album_id', albumId);
    }

    console.log('📡 Executing Supabase query without pagination...');
    const { data, count, error } = await query
      .order('fecha_subida', { ascending: false });

    console.log('📊 Supabase response:', { 
      dataLength: data?.length || 0, 
      count, 
      error: error?.message || null,
      firstItem: data?.[0] || null 
    });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

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
      album_id: albumId || null
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
  const { data, error } = await supabase
    .from('albumes')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
  
  return data || [];
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

export async function updateImageTitle(imageId: string, newTitle: string) {
  console.log('🔧 updateImageTitle called with:', { imageId, newTitle });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('❌ No authenticated session found');
    throw new Error('No authenticated session found');
  }

  console.log('✅ Session found, updating image title...');
  
  const { data, error } = await supabase
    .from('imagenes')
    .update({ titulo: newTitle })
    .eq('id', imageId)
    .select();

  if (error) {
    console.error('❌ Supabase update error:', error);
    throw error;
  }

  console.log('✅ Image title updated successfully:', data);
  return data;
}

export async function updateAlbumName(albumId: string, newName: string, newDescription?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const updateData: { nombre: string; descripcion?: string } = { nombre: newName };
  if (newDescription !== undefined) {
    updateData.descripcion = newDescription;
  }

  const { error } = await supabase
    .from('albumes')
    .update(updateData)
    .eq('id', albumId);

  if (error) throw error;
}

// Funciones para manejar foto de portada
export async function setCoverImage(imageId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  // Primero, quitar todas las imágenes de portada existentes
  const { error: resetError } = await supabase
    .from('imagenes')
    .update({ is_covered: false })
    .eq('is_covered', true);

  if (resetError) throw resetError;

  // Luego, establecer la nueva imagen como portada
  const { error } = await supabase
    .from('imagenes')
    .update({ is_covered: true })
    .eq('id', imageId);

  if (error) throw error;
}

export async function getCoverImage() {
  const { data, error } = await supabase
    .from('imagenes')
    .select('*')
    .eq('is_covered', true)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching cover image:', error);
    throw error;
  }
  
  return data || null;
}

// Nueva función para obtener múltiples imágenes de portada para el slideshow
export async function getCoverImages(limit: number = 3) {
  const { data, error } = await supabase
    .from('imagenes')
    .select('*')
    .eq('is_covered', true)
    .limit(limit);

  if (error) {
    console.error('Error fetching cover images:', error);
    throw error;
  }
  
  return data || [];
}

export async function removeCoverImage(imageId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const { error } = await supabase
    .from('imagenes')
    .update({ is_covered: false })
    .eq('id', imageId);

  if (error) throw error;
}