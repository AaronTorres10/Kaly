import { describe, expect, it, vi } from 'vitest';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: { create: (styles: unknown) => styles },
  Switch: 'Switch',
  Text: 'Text',
  TextInput: 'TextInput',
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

const validInput = {
  title: 'Casa del bosque',
  description: 'Un lugar tranquilo.',
  location: 'Mazamitla',
  pricePerNight: '1200',
  capacity: '4',
  amenities: ['Wi-Fi', 'Cocina'],
  isPublished: true,
};

describe('formulario de publicaciones', () => {
  it('valida campos obligatorios y números positivos enteros', async () => {
    const { parseAmenitiesText, validateListingForm } = await import('../../components/host/ListingForm');

    expect(validateListingForm({ ...validInput, title: '' })).toEqual({ title: 'Escribe un título.' });
    expect(validateListingForm({ ...validInput, location: '  ' })).toEqual({ location: 'Escribe una ubicación.' });
    expect(validateListingForm({ ...validInput, pricePerNight: '0' })).toEqual({ pricePerNight: 'Introduce un precio entero mayor que cero.' });
    expect(validateListingForm({ ...validInput, pricePerNight: '12.5' })).toEqual({ pricePerNight: 'Introduce un precio entero mayor que cero.' });
    expect(validateListingForm({ ...validInput, capacity: '0' })).toEqual({ capacity: 'Introduce una capacidad entera mayor que cero.' });
    expect(parseAmenitiesText('Wi-Fi, Cocina,')).toEqual(['Wi-Fi', ' Cocina', '']);
  });

  it('crea una publicación con el usuario actual y controla su publicación', async () => {
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: 'host-1' } as never }, error: null });
    const single = vi.fn().mockResolvedValue({ data: { id: 'listing-1' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    vi.mocked(supabase.from).mockReturnValue({ insert } as never);

    const { saveListing } = await import('../../lib/host/saveListing');
    await expect(saveListing(validInput)).resolves.toEqual({ id: 'listing-1' });
    expect(insert).toHaveBeenCalledWith({
      title: 'Casa del bosque',
      description: 'Un lugar tranquilo.',
      location: 'Mazamitla',
      price_per_night: 1200,
      capacity: 4,
      amenities: ['Wi-Fi', 'Cocina'],
      is_published: true,
      host_id: 'host-1',
    });
    expect(insert.mock.calls[0][0]).not.toHaveProperty('hostId');
  });

  it('edita solo una publicación del usuario actual', async () => {
    const { supabase } = await import('../../lib/supabase');
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: 'host-1' } as never }, error: null });
    const single = vi.fn().mockResolvedValue({ data: { id: 'listing-1' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const eqHost = vi.fn().mockReturnValue({ select });
    const eqId = vi.fn().mockReturnValue({ eq: eqHost });
    const update = vi.fn().mockReturnValue({ eq: eqId });
    vi.mocked(supabase.from).mockReturnValue({ update } as never);

    const { saveListing } = await import('../../lib/host/saveListing');
    await expect(saveListing({ ...validInput, id: 'listing-1', isPublished: false })).resolves.toEqual({ id: 'listing-1' });
    expect(eqId).toHaveBeenCalledWith('id', 'listing-1');
    expect(eqHost).toHaveBeenCalledWith('host_id', 'host-1');
    expect(update.mock.calls[0][0]).toMatchObject({ is_published: false });
    expect(update.mock.calls[0][0]).not.toHaveProperty('host_id');
  });
});
