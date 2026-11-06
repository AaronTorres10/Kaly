import { supabase } from '../supabase';

export type ListingQuery = {
  limit?: number;
  offset?: number;
};

export type ListingSummary = {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  capacity: number;
  coverImageUrl: string | null;
};

type ListingImage = {
  position: number;
  source_url: string | null;
};

type PublishedListingRow = {
  id: string;
  title: string;
  location: string;
  price_per_night: number;
  capacity: number;
  listing_images: ListingImage[] | null;
};

export async function listPublishedListings(params: ListingQuery = {}): Promise<ListingSummary[]> {
  let request = supabase
    .from('listings')
    .select('id, title, location, price_per_night, capacity, listing_images(source_url, position), created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });

  if (params.limit !== undefined || params.offset !== undefined) {
    const offset = Math.max(0, params.offset ?? 0);
    const limit = Math.max(1, params.limit ?? 20);
    request = request.range(offset, offset + limit - 1);
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as PublishedListingRow[]).map((listing) => {
    const coverImage = [...(listing.listing_images ?? [])]
      .filter((image) => image.source_url)
      .sort((first, second) => first.position - second.position)[0];

    return {
      id: listing.id,
      title: listing.title,
      location: listing.location,
      pricePerNight: listing.price_per_night,
      capacity: listing.capacity,
      coverImageUrl: coverImage?.source_url ?? null,
    };
  });
}
