import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://yimmcqpekqodtqgzvwtk.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_RVcdGk_gVYDw2bGv3xj9Zw_6ICAd9Ho';

export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_SUPABASE_URL;
  let trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed) return DEFAULT_SUPABASE_URL;

  // Handle case where raw project ref is provided e.g. "yimmcqpekqodtqgzvwtk"
  if (!trimmed.includes('.') && !trimmed.startsWith('http')) {
    return `https://${trimmed}.supabase.co`;
  }

  // Handle case where protocol is omitted e.g. "yimmcqpekqodtqgzvwtk.supabase.co"
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch (_) {}

  return DEFAULT_SUPABASE_URL;
}

export function normalizeSupabaseKey(rawKey?: string): string {
  if (!rawKey || typeof rawKey !== 'string') return DEFAULT_SUPABASE_KEY;
  const trimmed = rawKey.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.length > 10 ? trimmed : DEFAULT_SUPABASE_KEY;
}

const rawEnvUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const rawEnvKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;

const supabaseUrl = normalizeSupabaseUrl(rawEnvUrl);
const supabaseAnonKey = normalizeSupabaseKey(rawEnvKey);

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

