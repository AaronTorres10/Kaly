import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Las pruebas RLS requieren EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = url;
const supabaseAnonKey = anonKey;

const emailSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const credentials = [
  { email: `rls-host-${emailSuffix}@example.com`, password: 'RlsTestPassword123!' },
  { email: `rls-guest-${emailSuffix}@example.com`, password: 'RlsTestPassword123!' },
];

function newClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

async function createAuthenticatedClient(credentialsForUser: (typeof credentials)[number]) {
  const client = newClient();
  const signUp = await client.auth.signUp(credentialsForUser);
  if (signUp.error) throw signUp.error;
  if (!signUp.data.session) {
    const signIn = await client.auth.signInWithPassword(credentialsForUser);
    if (signIn.error) throw signIn.error;
  }
  return client;
}

describe('seguridad RLS en Supabase remoto', () => {
  let host: SupabaseClient;
  let guest: SupabaseClient;
  let anonymous: SupabaseClient;
  let hostId: string;
  let guestId: string;
  let listingId: string;
  let reservationId: string;

  beforeAll(async () => {
    [host, guest] = await Promise.all(credentials.map(createAuthenticatedClient));
    anonymous = newClient();
    hostId = (await host.auth.getUser()).data.user!.id;
    guestId = (await guest.auth.getUser()).data.user!.id;

    const listing = await host.from('listings').insert({
      host_id: hostId,
      title: 'RLS test listing',
      description: 'Temporary listing for RLS integration tests',
      location: 'Test city',
      price_per_night: 10000,
      capacity: 2,
      is_published: true,
    }).select('id').single();
    if (listing.error) throw listing.error;
    listingId = listing.data.id;

    const reservation = await guest.from('reservations').insert({
      guest_id: guestId,
      listing_id: listingId,
      check_in: '2099-01-10',
      check_out: '2099-01-12',
      guests: 1,
      total_amount: 20000,
      status: 'pending_payment',
    }).select('id').single();
    if (reservation.error) throw reservation.error;
    reservationId = reservation.data.id;
  });

  afterAll(async () => {
    await guest?.from('reservations').delete().eq('id', reservationId);
    await host?.from('listings').delete().eq('id', listingId);
    await host?.from('profiles').delete().eq('id', hostId);
    await guest?.from('profiles').delete().eq('id', guestId);
    await host?.auth.signOut();
    await guest?.auth.signOut();
  });

  it('permite al anónimo leer alojamientos publicados, pero no perfiles', async () => {
    const published = await anonymous.from('listings').select('id').eq('id', listingId).single();
    expect(published.error).toBeNull();
    expect(published.data?.id).toBe(listingId);

    const profiles = await anonymous.from('profiles').select('id').eq('id', hostId);
    expect(profiles.error).toBeNull();
    expect(profiles.data).toEqual([]);
  });

  it('aísla perfiles y reservas entre usuarios', async () => {
    const otherProfile = await guest.from('profiles').select('id').eq('id', hostId);
    expect(otherProfile.error).toBeNull();
    expect(otherProfile.data).toEqual([]);

    const ownReservations = await guest.from('reservations').select('id').eq('id', reservationId);
    expect(ownReservations.error).toBeNull();
    expect(ownReservations.data).toHaveLength(1);

    const hostReservations = await host.from('reservations').select('id').eq('id', reservationId);
    expect(hostReservations.error).toBeNull();
    expect(hostReservations.data).toHaveLength(1);
  });

  it('permite al anfitrión gestionar sus alojamientos y recursos relacionados', async () => {
    const image = await host.from('listing_images').insert({
      listing_id: listingId,
      source_url: 'https://images.example.test/rls.jpg',
      license: 'test',
      attribution: 'RLS test',
      position: 0,
    }).select('id').single();
    expect(image.error).toBeNull();

    const availability = await host.from('listing_availability').insert({
      listing_id: listingId,
      date: '2099-02-01',
      is_available: false,
    }).select('id').single();
    expect(availability.error).toBeNull();

    const guestCannotUpdate = await guest.from('listings').update({ title: 'not allowed' }).eq('id', listingId).select('id');
    expect(guestCannotUpdate.error).toBeNull();
    expect(guestCannotUpdate.data).toEqual([]);
  });
});
