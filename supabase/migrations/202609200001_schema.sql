create extension if not exists "btree_gist" with schema extensions;

create type public.reservation_status as enum ('pending_payment', 'paid', 'payment_failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  location text not null check (length(trim(location)) > 0),
  latitude double precision,
  longitude double precision,
  price_per_night integer not null check (price_per_night > 0),
  capacity integer not null check (capacity > 0),
  amenities text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text,
  source_url text,
  license text,
  attribution text,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  constraint listing_images_source_or_storage check (storage_path is not null or source_url is not null)
);

create table public.listing_availability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  date date not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (listing_id, date)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  check_in date not null,
  check_out date not null,
  stay daterange generated always as (daterange(check_in, check_out, '[)')) stored,
  guests integer not null check (guests > 0),
  total_amount integer not null check (total_amount >= 0),
  status public.reservation_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    listing_id with =,
    stay with &&
  ) where (status in ('pending_payment', 'paid'));

create index listings_host_id_idx on public.listings(host_id);
create index listings_published_idx on public.listings(is_published, created_at desc);
create index listing_images_listing_id_position_idx on public.listing_images(listing_id, position);
create index listing_availability_listing_id_date_idx on public.listing_availability(listing_id, date);
create index reservations_guest_id_idx on public.reservations(guest_id, check_in);
create index reservations_listing_id_idx on public.reservations(listing_id, check_in);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger listings_set_updated_at before update on public.listings
for each row execute function public.set_updated_at();
create trigger reservations_set_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
