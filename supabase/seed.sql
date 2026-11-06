-- Datos de ejemplo reproducibles para desarrollo local.
-- Las cuentas se crean sin una contraseña utilizable; el cargador remoto usa
-- DEMO_EMAIL y DEMO_PASSWORD mediante el cliente público de Supabase.

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'seed-host@kaly.example',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    '2026-09-20T00:00:00Z',
    '2026-09-20T00:00:00Z',
    '2026-09-20T00:00:00Z',
    '{"provider":"email","providers":["email"]}',
    '{}'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'seed-guest@kaly.example',
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    '2026-09-20T00:00:00Z',
    '2026-09-20T00:00:00Z',
    '2026-09-20T00:00:00Z',
    '{"provider":"email","providers":["email"]}',
    '{}'
  )
on conflict (id) do nothing;

insert into public.profiles (id, full_name, avatar_url, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'Mara Solís', null, '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222222', 'Leo Navarro', null, '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z')
on conflict (id) do update set
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = excluded.updated_at;

insert into public.listings (
  id, host_id, title, description, location, latitude, longitude,
  price_per_night, capacity, amenities, is_published, created_at, updated_at
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Casa Brisa',
    'Una casa luminosa con terraza y vistas abiertas.',
    'Valle de Bravo', 19.1922, -100.131, 12500, 4,
    array['wifi', 'terraza', 'cocina'], true,
    '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab',
    '11111111-1111-4111-8111-111111111111',
    'Estudio Niebla',
    'Un estudio tranquilo para una escapada sencilla.',
    'Tepoztlán', 18.9847, -99.0931, 7800, 2,
    array['wifi'], true,
    '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac',
    '11111111-1111-4111-8111-111111111111',
    'Refugio Silente',
    'Un refugio publicado a la espera de configurar su calendario.',
    'Mazamitla', 19.9161, -103.0206, 9900, 3,
    array['chimenea'], true,
    '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z'
  )
on conflict (id) do update set
  host_id = excluded.host_id,
  title = excluded.title,
  description = excluded.description,
  location = excluded.location,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  price_per_night = excluded.price_per_night,
  capacity = excluded.capacity,
  amenities = excluded.amenities,
  is_published = excluded.is_published,
  updated_at = excluded.updated_at;

insert into public.listing_images (id, listing_id, source_url, license, attribution, position, created_at)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    'Unsplash License', 'Foto de Hutomo Abrianto en Unsplash', 0, '2026-09-20T00:00:00Z'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
    'Unsplash License', 'Foto de Hutomo Abrianto en Unsplash', 1, '2026-09-20T00:00:00Z'
  )
on conflict (id) do update set
  listing_id = excluded.listing_id,
  source_url = excluded.source_url,
  license = excluded.license,
  attribution = excluded.attribution,
  position = excluded.position;

insert into public.listing_availability (id, listing_id, date, is_available, created_at)
values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2027-05-10', true, '2026-09-20T00:00:00Z'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2027-05-11', true, '2026-09-20T00:00:00Z'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', '2027-06-01', true, '2026-09-20T00:00:00Z'),
  ('10101010-1010-4010-8010-101010101010', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', '2027-06-02', true, '2026-09-20T00:00:00Z')
on conflict (id) do update set
  listing_id = excluded.listing_id,
  date = excluded.date,
  is_available = excluded.is_available;
