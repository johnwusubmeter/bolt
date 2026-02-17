import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Domain {
  id: string;
  name: string;
  price: number;
  word_count: number | null;
  category: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
