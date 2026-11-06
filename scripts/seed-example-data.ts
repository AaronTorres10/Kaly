import { createClient } from '@supabase/supabase-js';
import { EXAMPLE_LISTINGS } from './seed-data.ts';

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

async function assertSuccessful<T extends { error: { message: string } | null }>(
  result: T,
  operation: string,
) {
  if (result.error) throw new Error(`${operation}: ${result.error.message}`);
}

async function seedExampleData() {
  const supabaseUrl = requiredEnv('EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = requiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  const email = requiredEnv('DEMO_EMAIL');
  const password = requiredEnv('DEMO_PASSWORD');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (authError) throw new Error(`No se pudo iniciar sesión con la cuenta demo: ${authError.message}`);
  if (!authData.user) throw new Error('La sesión demo no devolvió un usuario');

  const demoUserId = authData.user.id;
  const listingIds = EXAMPLE_LISTINGS.map(({ id }) => id);

  // Con la anon key, RLS solo permite escribir el perfil de la sesión actual.
  // Por eso el perfil host del fixture se representa con el UUID de la cuenta demo.
  await assertSuccessful(
    await supabase.from('profiles').upsert({
      id: demoUserId,
      full_name: 'Mara Solís',
      avatar_url: null,
    }),
    'crear el perfil demo',
  );

  await assertSuccessful(
    await supabase.from('listing_images').delete().in('listing_id', listingIds),
    'limpiar imágenes del fixture',
  );
  await assertSuccessful(
    await supabase.from('listing_availability').delete().in('listing_id', listingIds),
    'limpiar disponibilidad del fixture',
  );

  const listings = EXAMPLE_LISTINGS.map((listing) => ({
    id: listing.id,
    host_id: demoUserId,
    title: listing.title,
    description: listing.description,
    location: listing.location,
    latitude: listing.latitude,
    longitude: listing.longitude,
    price_per_night: listing.pricePerNight,
    capacity: listing.capacity,
    amenities: listing.amenities,
    is_published: true,
  }));
  await assertSuccessful(
    await supabase.from('listings').upsert(listings, { onConflict: 'id' }),
    'crear alojamientos de ejemplo',
  );

  const images = EXAMPLE_LISTINGS.flatMap((listing) =>
    listing.images.map((image) => ({
      id: image.id,
      listing_id: listing.id,
      source_url: image.sourceUrl,
      license: image.license,
      attribution: image.attribution,
      position: image.position,
    })),
  );
  if (images.length > 0) {
    await assertSuccessful(
      await supabase.from('listing_images').insert(images),
      'crear imágenes de ejemplo',
    );
  }

  const availability = EXAMPLE_LISTINGS.flatMap((listing) =>
    listing.availability.map((day) => ({
      id: day.id,
      listing_id: listing.id,
      date: day.date,
      is_available: day.isAvailable,
    })),
  );
  if (availability.length > 0) {
    await assertSuccessful(
      await supabase.from('listing_availability').insert(availability),
      'crear disponibilidad de ejemplo',
    );
  }

  // La cuenta invitada del seed local no se crea aquí: Auth no permite crear
  // otro perfil con la anon key. No se insertan reservas reales.
  console.log(
    `Seed de ejemplo cargado: ${listings.length} alojamientos, ${images.length} imágenes y ${availability.length} días de disponibilidad.`,
  );
}

void seedExampleData().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'No se pudo cargar el seed de ejemplo');
  process.exitCode = 1;
});
