import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Get the current site URL for OAuth redirects
const getSiteUrl = () => {
    // In browser context, use the current window location
    if (typeof window !== 'undefined') {
        const { protocol, host } = window.location;
        return `${protocol}//${host}`;
    }

    // Fallback to environment variable or default
    return import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
};

// Initialize the Supabase client without a fixed redirect URL
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true
        // We'll specify redirectTo in each auth call instead
    }
});