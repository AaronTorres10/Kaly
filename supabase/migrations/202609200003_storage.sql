-- Listing photos are publicly readable because published listing details are public.
-- Writes remain restricted to the owner of the listing represented by the first
-- path segment: <listing_id>/<generated-file-name>.
insert into storage.buckets (id, name, public)
values ('listening-images', 'listening-images', true)
on conflict (id) do update set public = excluded.public;

create policy listing_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'listening-images');

create policy listing_images_host_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listening-images'
    and exists (
      select 1 from public.listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.host_id = auth.uid()
    )
  );

create policy listing_images_host_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listening-images'
    and exists (
      select 1 from public.listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.host_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'listening-images'
    and exists (
      select 1 from public.listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.host_id = auth.uid()
    )
  );

create policy listing_images_host_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listening-images'
    and exists (
      select 1 from public.listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.host_id = auth.uid()
    )
  );
