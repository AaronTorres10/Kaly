import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => ({
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  select: vi.fn(),
}));

const supabase = vi.hoisted(() => ({
  from: vi.fn(() => query),
  storage: { from: vi.fn(() => ({ getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://cdn.example/${path}` } })) })) },
}));

vi.mock('../../lib/supabase', () => ({ supabase }));

describe('getListingDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.eq.mockReturnValue(query);
    query.select.mockReturnValue(query);
  });

  it('rechaza un ID inexistente y un alojamiento no publicado', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    const { getListingDetail } = await import('../../lib/listings/getListingDetail');

    await expect(getListingDetail('missing')).rejects.toThrow('Alojamiento no encontrado');
    expect(query.eq).toHaveBeenCalledWith('id', 'missing');
    expect(query.eq).toHaveBeenCalledWith('is_published', true);
  });

  it('devuelve el detalle completo y resume la disponibilidad', async () => {
    query.maybeSingle.mockResolvedValue({
      data: {
        id: 'listing-1',
        title: 'Casa Brisa',
        location: 'Valle de Bravo',
        description: 'Un espacio tranquilo junto al lago.',
        amenities: ['wifi', 'terraza'],
        capacity: 4,
        price_per_night: 12500,
        latitude: 19.192,
        longitude: -99.49,
        listing_images: [{ id: 'image-1', position: 1, source_url: 'https://example.com/one.jpg', storage_path: null, license: 'Unsplash', attribution: 'Autora' }],
        listing_availability: [
          { date: '2027-05-10', is_available: true },
          { date: '2027-05-11', is_available: false },
        ],
      },
      error: null,
    });
    const { getListingDetail } = await import('../../lib/listings/getListingDetail');

    await expect(getListingDetail('listing-1')).resolves.toEqual({
      id: 'listing-1',
      title: 'Casa Brisa',
      location: 'Valle de Bravo',
      description: 'Un espacio tranquilo junto al lago.',
      amenities: ['wifi', 'terraza'],
      capacity: 4,
      pricePerNight: 12500,
      latitude: 19.192,
      longitude: -99.49,
      images: [{ id: 'image-1', position: 1, sourceUrl: 'https://example.com/one.jpg', storagePath: null, license: 'Unsplash', attribution: 'Autora' }],
      availability: {
        availableDates: ['2027-05-10'],
        unavailableDates: ['2027-05-11'],
      },
    });

    expect(supabase.from).toHaveBeenCalledWith('listings');
    expect(query.select).toHaveBeenCalledWith(expect.stringContaining('listing_images'));
  });

  it('propaga los errores del backend', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: { message: 'Network error' } });
    const { getListingDetail } = await import('../../lib/listings/getListingDetail');

    await expect(getListingDetail('listing-1')).rejects.toThrow('Network error');
  });

  it('convierte el storage_path de una foto propia en URL pública', async () => {
    query.maybeSingle.mockResolvedValue({
      data: {
        id: 'listing-1', title: 'Casa', location: 'Puebla', description: '', amenities: [], capacity: 2,
        price_per_night: 1800, latitude: null, longitude: null,
        listing_images: [{ id: 'image-1', position: 0, source_url: null, storage_path: 'listing-1/photo.jpg', license: null, attribution: null }],
        listing_availability: [],
      },
      error: null,
    });
    const { getListingDetail } = await import('../../lib/listings/getListingDetail');
    await expect(getListingDetail('listing-1')).resolves.toMatchObject({
      images: [{ sourceUrl: 'https://cdn.example/listing-1/photo.jpg', storagePath: 'listing-1/photo.jpg' }],
    });
  });
});
