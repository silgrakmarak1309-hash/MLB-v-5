import { supabase } from './supabase';

export const LISTING_IMAGE_BUCKET = 'Listing image';

export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function uploadListingImageToStorage(
  file: File | Blob,
  customName?: string
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const fileExt = (file as any).name ? (file as any).name.split('.').pop() : 'jpg';
  const cleanBaseName = customName || (file as any).name || 'photo';
  const safeName = cleanBaseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `listings/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeName}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(LISTING_IMAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(LISTING_IMAGE_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
