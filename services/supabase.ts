
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
      // Validar formato de URL básico
      if (!url.startsWith('http')) throw new Error("URL inválida");
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
      // Intentamos una operación mínima para verificar la tabla
      const { error } = await client.from('sessions').select('id').limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') return { success: true, message: '¡Conectado! (La tabla está lista y vacía)' };
        if (error.message.includes('relation "sessions" does not exist')) {
          return { success: false, message: 'ERROR: La tabla "sessions" no existe. ¿Le diste al botón RUN en el SQL Editor?' };
        }
        if (error.code === '42501') return { success: false, message: 'ERROR de Permisos: Debes ejecutar "ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;" en Supabase.' };
        return { success: false, message: `Error de Supabase: ${error.message}` };
      }
      return { success: true, message: '¡Conexión total establecida!' };
    } catch (err: any) {
      return { success: false, message: `Error de red: Verifica que la URL sea correcta.` };
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
        console.error('Error al descargar sesiones:', error.message);
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
        .upsert([session], { onConflict: 'id' });
      
      if (error) {
        console.error('Error al guardar sesión:', error.message);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Error inesperado al guardar:', err);
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
