
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PhotoSession } from '../types';

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
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.error("Error al crear cliente Supabase:", e);
      return null;
    }
  }
  return null;
};

export const supabaseService = {
  async testConnection(url: string, key: string): Promise<{success: boolean, message: string}> {
    try {
      const client = createClient(url, key);
      const { error } = await client.from('sessions').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST116') return { success: true, message: 'Conectado (Tabla vacía)' };
        if (error.message.includes('relation "sessions" does not exist')) {
          return { success: false, message: 'Error: La tabla "sessions" no existe en tu proyecto.' };
        }
        return { success: false, message: `Error: ${error.message}` };
      }
      return { success: true, message: '¡Conexión exitosa!' };
    } catch (err: any) {
      return { success: false, message: `Error de red: ${err.message}` };
    }
  },

  async getSessions(): Promise<PhotoSession[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Supabase fetch error:', error);
        return null;
      }
      return data as PhotoSession[];
    } catch (err) {
      return null;
    }
  },

  async saveSession(session: PhotoSession) {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
      const { data, error } = await client
        .from('sessions')
        .upsert([session]);
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Supabase save error:', err);
      return null;
    }
  },

  async deleteSession(id: string) {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('sessions').delete().eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  }
};
