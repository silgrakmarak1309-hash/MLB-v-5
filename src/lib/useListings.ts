import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { Listing } from '../types';

/**
 * Parses raw Supabase row into standard typed Listing.
 * Handles schema column differences dynamically, extracting embedded metadata
 * if columns like 'price', 'category_name', or 'status' were stored inside description.
 */
export function parseListingRow(row: any, profilesMap?: Record<string, any>): Listing {
  let meta: any = {};
  let cleanDesc = row.description || '';

  if (cleanDesc && typeof cleanDesc === 'string') {
    const metaMatch = cleanDesc.match(/<!--MLB_META:(.*?)-->/);
    if (metaMatch && metaMatch[1]) {
      try {
        meta = JSON.parse(metaMatch[1]);
        cleanDesc = cleanDesc.replace(/<!--MLB_META:(.*?)-->/, '').trim();
      } catch (_) {
        // Fallback if not valid JSON
      }
    }
  }

  const sellerProfile = profilesMap && row.seller_id ? profilesMap[row.seller_id] : null;

  const rawImages = row.image_urls || row.images || [];
  let imageUrls: string[] = [];
  if (Array.isArray(rawImages)) {
    imageUrls = rawImages.filter(Boolean);
  } else if (typeof rawImages === 'string') {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) imageUrls = parsed;
      else imageUrls = [rawImages];
    } catch (_) {
      imageUrls = [rawImages];
    }
  }

  if (imageUrls.length === 0) {
    imageUrls = [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    ];
  }

  const rawPrice = row.price ?? meta.price ?? row.delivery_fee ?? 0;
  const parsedPrice = Number(rawPrice) || 0;

  return {
    id: row.id,
    title: row.title || 'Untitled Item',
    description: cleanDesc,
    price: parsedPrice,
    category_name: row.category_name || row.category || meta.category || 'Shops',
    category: row.category || row.category_name || meta.category || 'Shops',
    condition: row.condition || meta.condition || 'Used - Like New',
    phone: row.phone || meta.phone || sellerProfile?.phone || '',
    whatsapp: row.whatsapp || meta.whatsapp || sellerProfile?.whatsapp || sellerProfile?.phone || '',
    seller_id: row.seller_id || undefined,
    seller_name:
      row.seller_name ||
      meta.seller_name ||
      sellerProfile?.name ||
      sellerProfile?.full_name ||
      'Verified Local Seller',
    seller_verified: row.seller_verified ?? true,
    seller_latitude:
      row.seller_latitude != null
        ? Number(row.seller_latitude)
        : meta.seller_latitude != null
        ? Number(meta.seller_latitude)
        : undefined,
    seller_longitude:
      row.seller_longitude != null
        ? Number(row.seller_longitude)
        : meta.seller_longitude != null
        ? Number(meta.seller_longitude)
        : undefined,
    state_name: row.state_name || row.state || 'Meghalaya',
    state: row.state || 'Meghalaya',
    district: row.district || undefined,
    block: row.block || undefined,
    village: row.village || undefined,
    location_name:
      row.location_name ||
      meta.location_name ||
      [row.village, row.block, row.district || 'Meghalaya'].filter(Boolean).join(', ') ||
      'Meghalaya',
    image_urls: imageUrls,
    images_json: row.images_json || JSON.stringify(imageUrls),
    status: row.status || meta.status || 'pending',
    is_featured: Boolean(row.is_featured ?? meta.is_featured ?? false),
    is_pro: Boolean(row.is_pro ?? meta.is_pro ?? false),
    is_heavy_item: Boolean(row.is_heavy_item ?? meta.is_heavy_item ?? false),
    weight: row.weight ?? meta.weight ?? undefined,
    views_count: row.views_count ?? 1,
    created_at: row.created_at || meta.created_at || new Date().toISOString(),
  };
}

/**
 * Real Supabase listings fetcher:
 * 1. Checks for 'status' column and queries supabase.from('listings').select('*').eq('status', 'active')
 * 2. Falls back gracefully to supabase.from('listings').select('*') or active_listings if 'status' column does not exist
 * 3. Safely populates seller profile details
 */
export async function fetchSupabaseListings(options: { activeOnly?: boolean } = {}): Promise<{ data: Listing[]; error: string | null }> {
  const { activeOnly = true } = options;

  if (!supabase) {
    return { data: [], error: 'Supabase client is not initialized.' };
  }

  try {
    // 1. Fetch profiles to resolve seller names and contact numbers
    let profilesMap: Record<string, any> = {};
    try {
      const { data: profs } = await supabase.from('profiles').select('id, name, email, phone, whatsapp');
      if (profs) {
        profilesMap = profs.reduce((acc: Record<string, any>, p: any) => {
          if (p.id) acc[p.id] = p;
          return acc;
        }, {});
      }
    } catch (_) {
      // Non-blocking profile join fallback
    }

    // 2. Fetch real listings from Supabase
    // Primary: Task 2 requirement: supabase.from('listings').select('*').eq('status', 'active')
    let rawListings: any[] | null = null;
    let queryError: any = null;

    try {
      let query = supabase.from('listings').select('*');
      if (activeOnly) {
        query = query.eq('status', 'active');
      }

      const primaryRes = await query;

      if (primaryRes.error) {
        // If status column does not exist in schema, fallback to select('*')
        if (
          primaryRes.error.message &&
          (primaryRes.error.message.toLowerCase().includes('status') ||
            primaryRes.error.code === '42703' ||
            primaryRes.error.code === 'PGRST204')
        ) {
          const fallbackRes = await supabase.from('listings').select('*');
          rawListings = fallbackRes.data;
          queryError = fallbackRes.error;
        } else {
          queryError = primaryRes.error;
        }
      } else {
        rawListings = primaryRes.data;
      }
    } catch (e: any) {
      queryError = e;
    }

    if (queryError) {
      console.warn('Supabase listings fetch issue, checking active_listings view:', queryError);
      // Fallback to active_listings view if listings table threw error
      try {
        const viewRes = await supabase.from('active_listings').select('*');
        if (!viewRes.error && viewRes.data) {
          rawListings = viewRes.data;
          queryError = null;
        }
      } catch (_) {}
    }

    if (queryError) {
      return { data: [], error: queryError?.message || 'Failed to fetch live listings.' };
    }

    // Parse and strictly filter for active approved listings if activeOnly is true (Task 2)
    const allParsed = (rawListings || []).map((row) => parseListingRow(row, profilesMap));
    const parsed = activeOnly
      ? allParsed.filter((listing) => listing.status === 'active')
      : allParsed;

    // Sort by created_at descending client-side
    parsed.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return { data: parsed, error: null };
  } catch (err: any) {
    console.error('fetchSupabaseListings fatal error:', err);
    return { data: [], error: err?.message || 'Unexpected error fetching listings.' };
  }
}

/**
 * Custom React Hook for live Supabase marketplace listings
 */
export function useListings(initialListings: Listing[] = []) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchSupabaseListings();
    if (result.error) {
      setError(result.error);
    } else {
      setListings(result.data);
    }
    setLoading(false);
    return result.data;
  }, []);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  return {
    listings,
    setListings,
    loading,
    error,
    refreshListings,
  };
}
