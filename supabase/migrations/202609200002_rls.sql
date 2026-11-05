alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_availability enable row level security;
alter table public.reservations enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete_own on public.profiles
  for delete to authenticated using (id = auth.uid());

create policy listings_select_published_or_own on public.listings
  for select to anon, authenticated
  using (is_published = true or host_id = auth.uid());
create policy listings_insert_own on public.listings
  for insert to authenticated
  with check (host_id = auth.uid());
create policy listings_update_own on public.listings
  for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy listings_delete_own on public.listings
  for delete to authenticated using (host_id = auth.uid());

create policy listing_images_select_published_or_host on public.listing_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and (listings.is_published or listings.host_id = auth.uid())
  ));
create policy listing_images_insert_host on public.listing_images
  for insert to authenticated
  with check (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()));
create policy listing_images_update_host on public.listing_images
  for update to authenticated
  using (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()))
  with check (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()));
create policy listing_images_delete_host on public.listing_images
  for delete to authenticated
  using (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()));

create policy listing_availability_select_published_or_host on public.listing_availability
  for select to anon, authenticated
  using (exists (
    select 1 from public.listings
    where listings.id = listing_availability.listing_id
      and (listings.is_published or listings.host_id = auth.uid())
  ));
create policy listing_availability_insert_host on public.listing_availability
  for insert to authenticated
  with check (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()));
create policy listing_availability_update_host on public.listing_availability
  for update to authenticated
  using (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()))
  with check (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()));
create policy listing_availability_delete_host on public.listing_availability
  for delete to authenticated
  using (exists (select 1 from public.listings where listings.id = listing_id and listings.host_id = auth.uid()));

create policy reservations_select_guest_or_host on public.reservations
  for select to authenticated
  using (guest_id = auth.uid() or exists (
    select 1 from public.listings where listings.id = reservations.listing_id and listings.host_id = auth.uid()
  ));
create policy reservations_insert_guest on public.reservations
  for insert to authenticated
  with check (
    guest_id = auth.uid()
    and exists (select 1 from public.listings where listings.id = listing_id and listings.is_published)
  );
create policy reservations_delete_guest on public.reservations
  for delete to authenticated using (guest_id = auth.uid());
