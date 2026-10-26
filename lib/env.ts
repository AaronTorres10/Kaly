type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string | undefined;
};

function requiredPublicEnv(name: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno pública ${name}`);
  }

  return value;
}

export const publicEnv: PublicEnv = {
  supabaseUrl: requiredPublicEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requiredPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined,
};
