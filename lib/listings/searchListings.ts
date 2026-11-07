import { supabase } from '../supabase';
import type { ListingSummary } from './listPublished';

export type SearchInput = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
};

type SearchListingImage = {
  position: number;
  source_url: string | null;
};

type SearchAvailability = {
  date: string;
  is_available: boolean;
};

type SearchListingRow = {
  id: string;
  title: string;
  location: string;
  price_per_night: number;
  capacity: number;
  listing_images: SearchListingImage[] | null;
  listing_availability: SearchAvailability[] | null;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string): number {
  if (!datePattern.test(value)) {
    throw new Error('Las fechas deben usar el formato AAAA-MM-DD.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error('La fecha indicada no es válida.');
  }

  return timestamp;
}

function getRequiredDates(checkIn: string, checkOut: string): string[] {
  const checkInTimestamp = parseDate(checkIn);
  const checkOutTimestamp = parseDate(checkOut);

  if (checkOutTimestamp <= checkInTimestamp) {
    throw new Error('Las fechas de salida deben ser posteriores a las fechas de entrada.');
  }

  const dates: string[] = [];
  for (let timestamp = checkInTimestamp; timestamp < checkOutTimestamp; timestamp += 24 * 60 * 60 * 1000) {
    dates.push(new Date(timestamp).toISOString().slice(0, 10));
  }
  return dates;
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function getCoverImage(images: SearchListingImage[] | null): string | null {
  return [...(images ?? [])]
    .filter((image) => image.source_url)
    .sort((first, second) => first.position - second.position)[0]?.source_url ?? null;
}

export async function searchListings(input: SearchInput = {}): Promise<ListingSummary[]> {
  const destination = input.destination?.trim();
  const amenities = [...new Set((input.amenities ?? []).map((amenity) => amenity.trim()).filter(Boolean))];

  if (input.guests !== undefined && (!Number.isInteger(input.guests) || input.guests < 1)) {
    throw new Error('El número de huéspedes debe ser al menos uno.');
  }

  if (input.minPrice !== undefined && (!Number.isFinite(input.minPrice) || input.minPrice < 0)) {
    throw new Error('El precio mínimo no es válido.');
  }

  if (input.maxPrice !== undefined && (!Number.isFinite(input.maxPrice) || input.maxPrice < 0)) {
    throw new Error('El precio máximo no es válido.');
  }

  if (input.minPrice !== undefined && input.maxPrice !== undefined && input.minPrice > input.maxPrice) {
    throw new Error('El precio mínimo no puede superar al precio máximo.');
  }

  const hasCheckIn = input.checkIn !== undefined;
  const hasCheckOut = input.checkOut !== undefined;
  if (hasCheckIn !== hasCheckOut) {
    throw new Error('Debes indicar las fechas de entrada y salida.');
  }

  const requiredDates = hasCheckIn && hasCheckOut
    ? getRequiredDates(input.checkIn as string, input.checkOut as string)
    : [];

  const availabilitySelection = requiredDates.length > 0
    ? 'listing_availability!inner(date, is_available)'
    : 'listing_availability(date, is_available)';
  let request = supabase
    .from('listings')
    .select(`id, title, location, price_per_night, capacity, listing_images(source_url, position), ${availabilitySelection}`)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });

  if (destination) {
    request = request.ilike('location', `%${escapeLikePattern(destination)}%`);
  }
  if (input.guests !== undefined) {
    request = request.gte('capacity', input.guests);
  }
  if (input.minPrice !== undefined) {
    request = request.gte('price_per_night', input.minPrice);
  }
  if (input.maxPrice !== undefined) {
    request = request.lte('price_per_night', input.maxPrice);
  }
  if (amenities.length > 0) {
    request = request.contains('amenities', amenities);
  }
  if (requiredDates.length > 0) {
    request = request
      .eq('listing_availability.is_available', true)
      .gte('listing_availability.date', requiredDates[0])
      .lt('listing_availability.date', input.checkOut as string);
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as SearchListingRow[])
    .filter((listing) => {
      if (requiredDates.length === 0) return true;
      const availableDates = new Set(
        (listing.listing_availability ?? [])
          .filter((availability) => availability.is_available)
          .map((availability) => availability.date),
      );
      return requiredDates.every((date) => availableDates.has(date));
    })
    .map((listing) => ({
      id: listing.id,
      title: listing.title,
      location: listing.location,
      pricePerNight: listing.price_per_night,
      capacity: listing.capacity,
      coverImageUrl: getCoverImage(listing.listing_images),
    }));
}
