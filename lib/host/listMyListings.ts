import { supabase } from '../supabase';

export type HostListingSummary = {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  capacity: number;
  isPublished: boolean;
  coverImageUrl: string | null;
};

type ListingRow = {
  id: string;
  title: string;
  location: string;
  price_per_night: number;
  capacity: number;
  is_published: boolean;
  listing_images?: Array<{ source_url: string | null; position: number }> | null;
};

export async function listMyListings(): Promise<HostListingSummary[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, location, price_per_night, capacity, is_published, listing_images(source_url, position)')
    .eq('host_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as ListingRow[]).map((listing) => ({
    id: listing.id,
    title: listing.title,
    location: listing.location,
    pricePerNight: listing.price_per_night,
    capacity: listing.capacity,
    isPublished: listing.is_published,
    coverImageUrl: [...(listing.listing_images ?? [])]
      .sort((first, second) => first.position - second.position)
      .find((image) => image.source_url)?.source_url ?? null,
  }));
}
