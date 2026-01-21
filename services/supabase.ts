
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PhotoSession } from '../types';

// Intentar obtener de variables de entorno o de localStorage
const getKeys = () => {
  const url = process.env.SUPABASE_URL || localStorage.getItem('supabase_url');
  const key = process.env.SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
  return { url, key };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  const { url, key } = getKeys();
  if (url && key) {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  }
  return null;
};

// Exportamos la instancia inicial (puede ser null)
export const supabase = getSupabaseClient();

export const supabaseService = {
  async getSessions(): Promise<PhotoSession[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching sessions:', error.message);
        return null;
      }
      return data as PhotoSession[];
    } catch (err) {
      console.error('Unexpected error:', err);
      return null;
    }
  },

  async saveSession(session: PhotoSession) {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
      const { data, error } = await client
        .from('sessions')
        .upsert([session]); // Usamos upsert para actualizar si el ID ya existe
      
      if (error) {
        console.error('Error saving session:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error:', err);
      return null;
    }
  },

  async deleteSession(id: string) {
    const client = getSupabaseClient();
    if (!client) return false;
    
    try {
      const { error } = await client
        .from('sessions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting session:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      return false;
    }
  }
};
