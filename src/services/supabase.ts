import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GalleryImage {
  id: string;
  url: string;
  titulo: string;
  fecha_subida: string;
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

export async function getImages(page = 1, pageSize = 12) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  console.log('Fetching images with params:', { page, pageSize, from, to });

  // Primero obtener el conteo total
  const { count, error: countError } = await supabase
    .from('imagenes')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    console.error('Error getting count:', countError);
    throw countError;
  }

  console.log('Total count:', count);

  // Luego obtener los registros paginados
  const { data, error } = await supabase
    .from('imagenes')
    .select('*')
    .order('fecha_subida', { ascending: false })
    .range(from, to);
    
  if (error) {
    console.error('Error fetching images:', error);
    throw error;
  }

  console.log('Fetched images:', data);
  
  return { 
    images: data as GalleryImage[],
    totalCount: count ?? 0
  };
}

export async function addImage(title: string, url: string) {
  // Verificar la sesión actual
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session found');
  }

  const { data, error } = await supabase
    .from('imagenes')
    .insert([{ 
      titulo: title, 
      url: url,
      fecha_subida: new Date().toISOString()
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
  // Verificar la sesión actual
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