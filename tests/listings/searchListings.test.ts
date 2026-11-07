import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => ({
  contains: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
  ilike: vi.fn(),
  lte: vi.fn(),
  lt: vi.fn(),
  order: vi.fn(),
  select: vi.fn(),
  then: vi.fn(),
}));

const supabase = vi.hoisted(() => ({
  from: vi.fn(() => query),
}));

vi.mock('../../lib/supabase', () => ({ supabase }));

describe('searchListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.contains.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    query.ilike.mockReturnValue(query);
    query.lte.mockReturnValue(query);
    query.lt.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.select.mockReturnValue(query);
  });

  it('combina destino parcial, fechas, huéspedes, precio y servicios', async () => {
    query.then = vi.fn((resolve) => resolve({
      data: [{
        id: 'listing-1',
        title: 'Casa Brisa',
        location: 'Valle de Bravo',
        price_per_night: 12500,
        capacity: 4,
        listing_images: [{ position: 0, source_url: 'https://example.com/cover.jpg' }],
        listing_availability: [
          { date: '2027-05-10', is_available: true },
          { date: '2027-05-11', is_available: true },
        ],
      }],
      error: null,
    }));

    const { searchListings } = await import('../../lib/listings/searchListings');
    await expect(searchListings({
      destination: 'Valle',
      checkIn: '2027-05-10',
      checkOut: '2027-05-12',
      guests: 3,
      minPrice: 10000,
      maxPrice: 15000,
      amenities: ['wifi', 'terraza'],
    })).resolves.toEqual([{
      id: 'listing-1',
      title: 'Casa Brisa',
      location: 'Valle de Bravo',
      pricePerNight: 12500,
      capacity: 4,
      coverImageUrl: 'https://example.com/cover.jpg',
    }]);

    expect(supabase.from).toHaveBeenCalledWith('listings');
    expect(query.eq).toHaveBeenCalledWith('is_published', true);
    expect(query.ilike).toHaveBeenCalledWith('location', '%Valle%');
    expect(query.gte).toHaveBeenCalledWith('capacity', 3);
    expect(query.gte).toHaveBeenCalledWith('price_per_night', 10000);
    expect(query.lte).toHaveBeenCalledWith('price_per_night', 15000);
    expect(query.contains).toHaveBeenCalledWith('amenities', ['wifi', 'terraza']);
    expect(query.gte).toHaveBeenCalledWith('listing_availability.date', '2027-05-10');
    expect(query.lt).toHaveBeenCalledWith('listing_availability.date', '2027-05-12');
  });

  it('no aplica filtros accidentales a una entrada vacía y devuelve cero resultados', async () => {
    query.then = vi.fn((resolve) => resolve({ data: [], error: null }));

    const { searchListings } = await import('../../lib/listings/searchListings');
    await expect(searchListings({ destination: '  ', amenities: [] })).resolves.toEqual([]);

    expect(query.ilike).not.toHaveBeenCalled();
    expect(query.contains).not.toHaveBeenCalled();
  });

  it('excluye un alojamiento al que le falta un día disponible del rango', async () => {
    query.then = vi.fn((resolve) => resolve({
      data: [{
        id: 'listing-1',
        title: 'Casa Brisa',
        location: 'Valle de Bravo',
        price_per_night: 12500,
        capacity: 4,
        listing_images: [],
        listing_availability: [{ date: '2027-05-10', is_available: true }],
      }],
      error: null,
    }));

    const { searchListings } = await import('../../lib/listings/searchListings');
    await expect(searchListings({ checkIn: '2027-05-10', checkOut: '2027-05-12' })).resolves.toEqual([]);
  });

  it('rechaza fechas invertidas y huéspedes menores que uno antes de consultar', async () => {
    const { searchListings } = await import('../../lib/listings/searchListings');

    await expect(searchListings({ checkIn: '2027-05-12', checkOut: '2027-05-10' })).rejects.toThrow('fechas');
    await expect(searchListings({ guests: 0 })).rejects.toThrow('huéspedes');
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
