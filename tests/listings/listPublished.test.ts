import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => ({
  eq: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
  select: vi.fn(),
  then: vi.fn(),
}));

const supabase = vi.hoisted(() => ({
  from: vi.fn(() => query),
}));

vi.mock('../../lib/supabase', () => ({ supabase }));

vi.mock('react-native', () => ({
  Image: 'Image',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
  Text: 'Text',
  View: 'View',
}));

describe('listPublishedListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.range.mockReturnValue(query);
  });

  it('solo consulta alojamientos publicados con un orden estable y mapea la portada', async () => {
    query.then = vi.fn((resolve) => resolve({
      data: [
        {
          id: 'listing-1',
          title: 'Casa Brisa',
          location: 'Valle de Bravo',
          price_per_night: 12500,
          capacity: 4,
          created_at: '2026-09-20T00:00:00Z',
          listing_images: [{ position: 1, source_url: 'https://example.com/second.jpg' }, { position: 0, source_url: 'https://example.com/cover.jpg' }],
        },
      ],
      error: null,
    }));

    const { listPublishedListings } = await import('../../lib/listings/listPublished');
    await expect(listPublishedListings({})).resolves.toEqual([
      {
        id: 'listing-1',
        title: 'Casa Brisa',
        location: 'Valle de Bravo',
        pricePerNight: 12500,
        capacity: 4,
        coverImageUrl: 'https://example.com/cover.jpg',
      },
    ]);

    expect(supabase.from).toHaveBeenCalledWith('listings');
    expect(query.eq).toHaveBeenCalledWith('is_published', true);
    expect(query.order).toHaveBeenNthCalledWith(1, 'created_at', { ascending: false });
    expect(query.order).toHaveBeenNthCalledWith(2, 'id', { ascending: true });
  });

  it('aplica el rango opcional y propaga los errores de Supabase', async () => {
    query.then = vi.fn((resolve) => resolve({ data: null, error: { message: 'Sin conexión' } }));

    const { listPublishedListings } = await import('../../lib/listings/listPublished');
    await expect(listPublishedListings({ limit: 10, offset: 20 })).rejects.toThrow('Sin conexión');
    expect(query.range).toHaveBeenCalledWith(20, 29);
  });
});

describe('ListingCard', () => {
  it('representa un alojamiento sin foto con un placeholder accesible', async () => {
    const { ListingCard } = await import('../../components/listings/ListingCard');
    const element = ListingCard({
      listing: {
        id: 'listing-1',
        title: 'Refugio Silente',
        location: 'Mazamitla',
        pricePerNight: 9900,
        capacity: 3,
        coverImageUrl: null,
      },
      onPress: vi.fn(),
    });

    const children = element.props.children as unknown[];
    const imageContainer = children[0] as { props: { children: { props: { accessibilityLabel: string } } } };
    expect(imageContainer.props.children.props.accessibilityLabel).toBe('Este alojamiento no tiene fotos');
    expect(element.props.accessibilityRole).toBe('button');
    expect(createElement).toBeDefined();
  });
});
