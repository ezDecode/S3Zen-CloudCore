/**
 * Supabase Client (Browser)
 * Uses anon key - safe for frontend
 * Handles user authentication
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables:');
    console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
    console.error('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

export const supabaseAuth = supabase.auth;

export default supabase;
