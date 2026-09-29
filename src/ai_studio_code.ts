import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Dynamically resolves the OAuth redirect URL from the current browser origin.
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const envUrl = typeof import.meta !== 'undefined'
    ? import.meta.env?.VITE_APP_URL || import.meta.env?.VITE_SITE_URL
    : undefined;
  return envUrl ? envUrl.replace(/\/+$/, '') : 'https://mlb-v-5.vercel.app';
}

/**
 * Initiates Google OAuth sign-in with dynamic redirectTo
 */
export async function signInWithGoogle(customRedirectUrl?: string) {
  const redirectUrl = customRedirectUrl || getAuthRedirectUrl();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
}

// ============================================================================
// Types
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  district?: string;
  role?: string;
  wallet_balance?: number;
  is_pro?: boolean;
  pro_status?: string;
  account_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Listing {
  id?: string;
  title: string;
  description?: string;
  price: number;
  delivery_fee?: number;
  category: string;
  condition?: string;
  phone?: string;
  seller_id?: string;
  seller_name?: string;
  seller_verified?: boolean;
  state?: string;
  district?: string;
  image_urls?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryOrder {
  id?: string;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  buyer_id?: string;
  seller_id?: string;
  pickup_address: string;
  delivery_address: string;
  item_description?: string;
  total_fare: number;
  product_price?: number;
  delivery_fee?: number;
  status?: string;
  payment_method?: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// User Profiles (SELECT, UPSERT)
// ============================================================================

/**
 * Fetch a user profile by ID.
 */
export async function getProfile(userId: string): Promise<{ profile: Profile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (err: any) {
    console.error('Error fetching profile:', err?.message || err);
    return { profile: null, error: err };
  }
}

/**
 * Upsert or update a user profile.
 */
export async function saveProfile(profile: Partial<Profile> & { id: string }): Promise<{ profile: Profile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (err: any) {
    console.error('Error saving profile:', err?.message || err);
    return { profile: null, error: err };
  }
}

// ============================================================================
// Marketplace Listings (SELECT, INSERT, UPDATE, DELETE)
// ============================================================================

/**
 * Fetch active marketplace listings.
 */
export async function fetchListings(activeOnly = true): Promise<{ listings: Listing[]; error: Error | null }> {
  try {
    let query = supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw error;
    return { listings: data || [], error: null };
  } catch (err: any) {
    console.error('Error fetching listings:', err?.message || err);
    return { listings: [], error: err };
  }
}

/**
 * Insert a new listing.
 */
export async function createListing(listing: Listing): Promise<{ listing: Listing | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([listing])
      .select()
      .single();

    if (error) throw error;
    return { listing: data, error: null };
  } catch (err: any) {
    console.error('Error creating listing:', err?.message || err);
    return { listing: null, error: err };
  }
}

/**
 * Update an existing listing.
 */
export async function updateListing(listingId: string, updates: Partial<Listing>): Promise<{ listing: Listing | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();

    if (error) throw error;
    return { listing: data, error: null };
  } catch (err: any) {
    console.error('Error updating listing:', err?.message || err);
    return { listing: null, error: err };
  }
}

/**
 * Delete a listing.
 */
export async function deleteListing(listingId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error deleting listing:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================================
// Orders & Deliveries (SELECT, INSERT, UPDATE)
// ============================================================================

/**
 * Fetch orders for a buyer or seller.
 */
export async function fetchOrders(userId?: string): Promise<{ orders: DeliveryOrder[]; error: Error | null }> {
  try {
    let query = supabase.from('delivery_orders').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { orders: data || [], error: null };
  } catch (err: any) {
    console.error('Error fetching orders:', err?.message || err);
    return { orders: [], error: err };
  }
}

/**
 * Place a new delivery order.
 */
export async function createOrder(order: DeliveryOrder): Promise<{ order: DeliveryOrder | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('delivery_orders')
      .insert([order])
      .select()
      .single();

    if (error) throw error;
    return { order: data, error: null };
  } catch (err: any) {
    console.error('Error creating order:', err?.message || err);
    return { order: null, error: err };
  }
}

/**
 * Update order status.
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<{ order: DeliveryOrder | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('delivery_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { order: data, error: null };
  } catch (err: any) {
    console.error('Error updating order status:', err?.message || err);
    return { order: null, error: err };
  }
}

// ============================================================================
// Image Upload (Storage Bucket: Listing image)
// ============================================================================

/**
 * Upload an image file to Supabase Storage and return public URL.
 */
export async function uploadListingImage(file: File | Blob, customName?: string): Promise<string> {
  const fileExt = (file as any).name ? (file as any).name.split('.').pop() : 'jpg';
  const cleanBaseName = customName || (file as any).name || 'photo';
  const safeName = cleanBaseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `listings/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeName}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('Listing image')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('Listing image')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
