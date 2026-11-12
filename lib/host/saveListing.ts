import { supabase } from '../supabase';

export type ListingFormInput = {
  id?: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: string;
  capacity: string;
  amenities: string[];
  isPublished: boolean;
};

export type ListingFormErrors = Partial<Record<'title' | 'location' | 'pricePerNight' | 'capacity', string>>;

export function validateListingForm(input: ListingFormInput): ListingFormErrors {
  if (!input.title.trim()) return { title: 'Escribe un título.' };
  if (!input.location.trim()) return { location: 'Escribe una ubicación.' };
  if (!/^\d+$/.test(input.pricePerNight) || Number(input.pricePerNight) <= 0) {
    return { pricePerNight: 'Introduce un precio entero mayor que cero.' };
  }
  if (!/^\d+$/.test(input.capacity) || Number(input.capacity) <= 0) {
    return { capacity: 'Introduce una capacidad entera mayor que cero.' };
  }
  return {};
}

export async function saveListing(input: ListingFormInput): Promise<{ id: string }> {
  const errors = validateListingForm(input);
  if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Inicia sesión para guardar una publicación.');

  const values = {
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    price_per_night: Number(input.pricePerNight),
    capacity: Number(input.capacity),
    amenities: input.amenities.map((amenity) => amenity.trim()).filter(Boolean),
    is_published: input.isPublished,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from('listings')
      .update(values)
      .eq('id', input.id)
      .eq('host_id', userData.user.id)
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({ ...values, host_id: userData.user.id })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id };
}
