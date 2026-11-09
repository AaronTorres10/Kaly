import { supabase } from '../supabase';

export type ListingImage = {
  id: string;
  position: number;
  sourceUrl: string | null;
  storagePath: string | null;
  license: string | null;
  attribution: string | null;
};

export type ListingAvailability = {
  availableDates: string[];
  unavailableDates: string[];
};

export type ListingDetail = {
  id: string;
  title: string;
  location: string;
  description: string;
  amenities: string[];
  capacity: number;
  pricePerNight: number;
  latitude: number | null;
  longitude: number | null;
  images: ListingImage[];
  availability: ListingAvailability;
};

type ListingDetailRow = {
  id: string;
  title: string;
  location: string;
  description: string;
  amenities: string[] | null;
  capacity: number;
  price_per_night: number;
  latitude: number | null;
  longitude: number | null;
  listing_images: Array<{
    id: string;
    position: number;
    source_url: string | null;
    storage_path: string | null;
    license: string | null;
    attribution: string | null;
  }> | null;
  listing_availability: Array<{ date: string; is_available: boolean }> | null;
};

const detailSelection = `
  id, title, location, description, amenities, capacity, price_per_night,
  latitude, longitude,
  listing_images(id, position, source_url, storage_path, license, attribution),
  listing_availability(date, is_available)
`;

export async function getListingDetail(id: string): Promise<ListingDetail> {
  const { data, error } = await supabase
    .from('listings')
    .select(detailSelection)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Alojamiento no encontrado.');

  const listing = data as unknown as ListingDetailRow;
  const availability = listing.listing_availability ?? [];

  return {
    id: listing.id,
    title: listing.title,
    location: listing.location,
    description: listing.description,
    amenities: listing.amenities ?? [],
    capacity: listing.capacity,
    pricePerNight: listing.price_per_night,
    latitude: listing.latitude,
    longitude: listing.longitude,
    images: [...(listing.listing_images ?? [])]
      .sort((first, second) => first.position - second.position)
      .map((image) => ({
        id: image.id,
        position: image.position,
        sourceUrl: image.source_url,
        storagePath: image.storage_path,
        license: image.license,
        attribution: image.attribution,
      })),
    availability: {
      availableDates: availability.filter((day) => day.is_available).map((day) => day.date),
      unavailableDates: availability.filter((day) => !day.is_available).map((day) => day.date),
    },
  };
}
