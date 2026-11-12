import { describe, expect, it, vi } from 'vitest';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  Image: 'Image',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: { create: (styles: unknown) => styles },
  Text: 'Text',
  View: 'View',
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/auth/email', () => ({
  useAuth: vi.fn(),
}));

describe('pestaña del anfitrión', () => {
  it('devuelve una lista vacía si no hay una sesión', async () => {
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as never);

    const { listMyListings } = await import('../../lib/host/listMyListings');

    await expect(listMyListings()).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('consulta solo publicaciones del usuario actual y mapea sus fotos', async () => {
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'host-1' } as never },
      error: null,
    });
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'listing-1',
          title: 'Casa del bosque',
          location: 'Mazamitla',
          price_per_night: 1200,
          capacity: 4,
          is_published: true,
          listing_images: [{ source_url: 'https://example.com/cover.jpg', position: 0 }],
        },
      ],
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ order });
    vi.mocked(supabase.from).mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) } as never);

    const { listMyListings } = await import('../../lib/host/listMyListings');

    await expect(listMyListings()).resolves.toEqual([
      {
        id: 'listing-1',
        title: 'Casa del bosque',
        location: 'Mazamitla',
        pricePerNight: 1200,
        capacity: 4,
        isPublished: true,
        coverImageUrl: 'https://example.com/cover.jpg',
      },
    ]);
    expect(eq).toHaveBeenCalledWith('host_id', 'host-1');
  });

  it('muestra un CTA para crear y enlaces de gestión en la tarjeta', async () => {
    const { HostListingCard } = await import('../../components/host/HostListingCard');
    const card = HostListingCard({
      listing: {
        id: 'listing-1',
        title: 'Casa del bosque',
        location: 'Mazamitla',
        pricePerNight: 1200,
        capacity: 4,
        isPublished: false,
        coverImageUrl: null,
      },
      onEdit: vi.fn(),
      onPhotos: vi.fn(),
    });
    const containsText = (node: unknown, text: string): boolean => {
      if (!node || typeof node !== 'object') return false;
      const props = (node as { props?: { children?: unknown } }).props;
      if (props?.children === text) return true;
      if (Array.isArray(props?.children)) return props.children.some((child) => containsText(child, text));
      return containsText(props?.children, text);
    };
    expect(containsText(card, 'Editar publicación')).toBe(true);
    expect(containsText(card, 'Fotos')).toBe(true);
  });
});
