import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard: Stop the app if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Check your .env file.');
}

// FIX: Do NOT add a "global: { headers: ... }" block here.
// The Supabase client handles the Authorization header automatically 
// when a user logs in.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);