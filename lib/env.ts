type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string | undefined;
};

function requiredPublicEnv(name: string, value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`Falta la variable de entorno pública ${name}`);
  }

  return normalizedValue;
}

export const publicEnv: PublicEnv = {
  supabaseUrl: requiredPublicEnv(
    'EXPO_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: requiredPublicEnv(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined,
};
