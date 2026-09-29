import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yimmcqpekqodtqgzvwtk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RVcdGk_gVYDw2bGv3xj9Zw_6ICAd9Ho';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Resolves the dynamic redirect URL for OAuth sign-in.
 * Prefers the current window.location.origin (e.g. https://your-app.vercel.app),
 * falling back to configured VITE_APP_URL / VITE_SITE_URL environment variables.
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const envAppUrl = typeof import.meta !== 'undefined'
    ? import.meta.env?.VITE_APP_URL || import.meta.env?.VITE_SITE_URL
    : undefined;
  return envAppUrl ? envAppUrl.replace(/\/+$/, '') : 'https://mlb-v-5.vercel.app';
}

