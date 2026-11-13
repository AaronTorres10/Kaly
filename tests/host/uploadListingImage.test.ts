import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

const upload = vi.fn();
const getPublicUrl = vi.fn();
const remove = vi.fn();
const { fileBytes } = vi.hoisted(() => ({ fileBytes: vi.fn() }));
const storageFrom = vi.fn(() => ({ upload, getPublicUrl, remove }));
const from = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: { storage: { from: storageFrom }, from },
}));

vi.mock('expo-file-system', () => ({
  File: class MockFile {
    bytes() { return fileBytes(); }
  },
}));

const validAsset = {
  uri: 'file:///tmp/photo.jpg',
  fileName: 'photo.jpg',
  fileSize: 1024,
  mimeType: 'image/jpeg',
};

function imageQuery(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    single: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.insert.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.single.mockResolvedValue({ data, error });
  from.mockReturnValue(query);
  return query;
}

describe('gestión de fotos de publicaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upload.mockResolvedValue({ data: { path: 'listing-1/photo.jpg' }, error: null });
    getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/listening-images/listing-1/photo.jpg' } });
    remove.mockResolvedValue({ data: null, error: null });
    fileBytes.mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer) }));
  });

  it('rechaza MIME y tamaño inválidos antes de subir', async () => {
    const { uploadListingImage } = await import('../../lib/host/uploadListingImage');
    await expect(uploadListingImage('listing-1', { ...validAsset, mimeType: 'image/gif' })).rejects.toThrow('formato');
    await expect(uploadListingImage('listing-1', { ...validAsset, fileSize: 11 * 1024 * 1024 })).rejects.toThrow('tamaño');
    expect(upload).not.toHaveBeenCalled();
  });

  it('sube una foto propia sin metadatos y devuelve la URL pública', async () => {
    const query = imageQuery([], null);
    query.single.mockResolvedValue({ data: { id: 'image-1', listing_id: 'listing-1', storage_path: 'listing-1/photo.jpg', source_url: null, license: null, attribution: null, position: 0, created_at: '2026-01-01' }, error: null });
    const { uploadListingImage } = await import('../../lib/host/uploadListingImage');
    const result = await uploadListingImage('listing-1', validAsset);
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^listing-1\//), expect.any(ArrayBuffer), expect.objectContaining({ contentType: 'image/jpeg' }));
    expect(fileBytes).toHaveBeenCalledWith();
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({ listing_id: 'listing-1', source_url: null, license: null, attribution: null }));
    expect(result.sourceUrl).toBeNull();
  });

  it('devuelve un error claro si Storage rechaza la subida', async () => {
    upload.mockResolvedValue({ data: null, error: new Error('storage offline') });
    const { uploadListingImage } = await import('../../lib/host/uploadListingImage');
    await expect(uploadListingImage('listing-1', validAsset)).rejects.toThrow('subir la foto');
    expect(from).not.toHaveBeenCalled();
  });

  it('elimina el objeto y el registro asociado', async () => {
    const query = imageQuery({ storage_path: 'listing-1/photo.jpg' }, null);
    query.single.mockResolvedValue({ data: { storage_path: 'listing-1/photo.jpg' }, error: null });
    const { deleteListingImage } = await import('../../lib/host/uploadListingImage');
    await deleteListingImage('listing-1', 'image-1');
    expect(remove).toHaveBeenCalledWith(['listing-1/photo.jpg']);
    expect(query.delete).toHaveBeenCalled();
    expect(query.eq).toHaveBeenCalledWith('listing_id', 'listing-1');
  });

  it('reordena las fotos con posiciones consecutivas', async () => {
    const query = imageQuery(null, null);
    const { reorderListingImages } = await import('../../lib/host/uploadListingImage');
    await reorderListingImages('listing-1', ['image-3', 'image-1', 'image-2']);
    expect(query.update).toHaveBeenCalledTimes(3);
    expect(query.update).toHaveBeenNthCalledWith(1, { position: 0 });
    expect(query.update).toHaveBeenNthCalledWith(2, { position: 1 });
    expect(query.update).toHaveBeenNthCalledWith(3, { position: 2 });
  });
});
