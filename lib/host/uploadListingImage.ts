import type { ImagePickerAsset } from 'expo-image-picker';
import { File } from 'expo-file-system';

import { supabase } from '../supabase';

export const LISTING_IMAGES_BUCKET = 'listening-images';
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function randomId(): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    const value = character === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

export type ImageAsset = Pick<ImagePickerAsset, 'uri' | 'fileName' | 'fileSize' | 'mimeType'> & {
  sourceUrl?: string;
  license?: string;
  attribution?: string;
  file?: Blob;
};

export type ListingImage = {
  id: string;
  listingId: string;
  storagePath: string | null;
  sourceUrl: string | null;
  license: string | null;
  attribution: string | null;
  position: number;
  url: string;
};

function assertValidAsset(asset: ImageAsset): void {
  if (!asset.mimeType || !ALLOWED_MIME_TYPES.has(asset.mimeType)) {
    throw new Error('El formato de la imagen no es compatible. Usa JPG, PNG o WebP.');
  }
  if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('El tamaño de la imagen no puede superar 10 MB.');
  }
}

function extensionFor(mimeType: string): string {
  return mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
}

async function assetBytes(asset: ImageAsset): Promise<ArrayBuffer> {
  try {
    if (asset.file) return asset.file.arrayBuffer();
    if (asset.uri.startsWith('file://') || asset.uri.startsWith('content://')) {
      const fileBytes = await new File(asset.uri).bytes();
      return fileBytes.buffer.slice(fileBytes.byteOffset, fileBytes.byteOffset + fileBytes.byteLength) as ArrayBuffer;
    }
    const response = await fetch(asset.uri);
    return response.arrayBuffer();
  } catch {
    throw new Error('No hemos podido leer la imagen seleccionada.');
  }
}

function toListingImage(row: Record<string, unknown>, publicUrl: string): ListingImage {
  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    storagePath: row.storage_path ? String(row.storage_path) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    license: row.license ? String(row.license) : null,
    attribution: row.attribution ? String(row.attribution) : null,
    position: Number(row.position ?? 0),
    url: publicUrl,
  };
}

export async function uploadListingImage(listingId: string, asset: ImageAsset): Promise<ListingImage> {
  assertValidAsset(asset);
  const bytes = await assetBytes(asset);
  const mimeType = asset.mimeType as string;
  const path = `${listingId}/${randomId()}.${extensionFor(mimeType)}`;
  const storage = supabase.storage.from(LISTING_IMAGES_BUCKET);
  const { error: uploadError } = await storage.upload(path, bytes, { contentType: mimeType, upsert: false });
  if (uploadError) throw new Error('No hemos podido subir la foto. Inténtalo de nuevo.');

  try {
    const { data: existing, error: existingError } = await supabase
      .from('listing_images')
      .select('position')
      .eq('listing_id', listingId);
    if (existingError) throw existingError;
    const position = Math.max(-1, ...((existing ?? []) as Array<{ position: number }>).map((image) => image.position)) + 1;
    const { data, error } = await supabase
      .from('listing_images')
      .insert({ listing_id: listingId, storage_path: path, source_url: asset.sourceUrl?.trim() || null, license: asset.license?.trim() || null, attribution: asset.attribution?.trim() || null, position })
      .select()
      .single();
    if (error || !data) throw error ?? new Error('No hemos podido registrar la foto.');
    const { data: publicData } = storage.getPublicUrl(path);
    return toListingImage(data as unknown as Record<string, unknown>, publicData.publicUrl);
  } catch (error) {
    await storage.remove([path]);
    throw error;
  }
}

export async function deleteListingImage(listingId: string, imageId: string): Promise<void> {
  const { data, error } = await supabase.from('listing_images').select('storage_path').eq('listing_id', listingId).eq('id', imageId).single();
  if (error || !data) throw new Error('No hemos podido encontrar la foto.');
  const storage = supabase.storage.from(LISTING_IMAGES_BUCKET);
  const path = (data as { storage_path: string | null }).storage_path;
  if (path) {
    const { error: storageError } = await storage.remove([path]);
    if (storageError) throw new Error('No hemos podido borrar el archivo de la foto.');
  }
  const { error: deleteError } = await supabase.from('listing_images').delete().eq('listing_id', listingId).eq('id', imageId);
  if (deleteError) throw new Error('No hemos podido borrar el registro de la foto.');
}

export async function reorderListingImages(listingId: string, imageIds: string[]): Promise<void> {
  await Promise.all(imageIds.map(async (imageId, position) => {
    const { error } = await supabase.from('listing_images').update({ position }).eq('listing_id', listingId).eq('id', imageId);
    if (error) throw new Error('No hemos podido guardar el orden de las fotos.');
  }));
}

export function isValidImageAsset(asset: ImageAsset): boolean {
  try {
    assertValidAsset(asset);
    return true;
  } catch {
    return false;
  }
}
