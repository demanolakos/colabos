
import { createClient } from '@supabase/supabase-js';
import { PhotoSession } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Solo inicializamos si tenemos las credenciales
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const supabaseService = {
  async getSessions(): Promise<PhotoSession[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
    return data as PhotoSession[];
  },

  async saveSession(session: PhotoSession) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sessions')
      .insert([session]);
    
    if (error) console.error('Error saving session:', error);
    return data;
  },

  async deleteSession(id: string) {
    if (!supabase) return null;
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) console.error('Error deleting session:', error);
    return !error;
  }
};
