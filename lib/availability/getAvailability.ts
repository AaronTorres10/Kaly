import { supabase } from '../supabase';

export type AvailabilityDay = {
  date: string;
  isAvailable: boolean;
};

function getNextMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1));
  return next.toISOString().slice(0, 10);
}

export async function getAvailability(listingId: string, month: string): Promise<AvailabilityDay[]> {
  if (!listingId || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error('El mes solicitado no es válido.');
  }

  const { data, error } = await supabase
    .from('listing_availability')
    .select('date, is_available')
    .eq('listing_id', listingId)
    .gte('date', `${month}-01`)
    .lt('date', getNextMonth(month))
    .order('date', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((day) => ({
    date: day.date,
    isAvailable: day.is_available,
  }));
}
