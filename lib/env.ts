export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey?: string;
};

type PublicEnvInput = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  stripePublishableKey?: string;
};

const missing = (value: string | undefined): boolean => !value?.trim();

export function loadPublicEnv(input: PublicEnvInput): PublicEnv {
  const missingVariables = [
    missing(input.supabaseUrl) ? 'EXPO_PUBLIC_SUPABASE_URL' : undefined,
    missing(input.supabaseAnonKey) ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY' : undefined,
  ].filter((name): name is string => Boolean(name));

  if (missingVariables.length > 0) {
    throw new Error(`Faltan variables públicas: ${missingVariables.join(', ')}`);
  }

  return {
    supabaseUrl: input.supabaseUrl!.trim(),
    supabaseAnonKey: input.supabaseAnonKey!.trim(),
    stripePublishableKey: input.stripePublishableKey?.trim() || undefined,
  };
}

// Expo reemplaza estas referencias estáticas de process.env al crear el bundle.
// La clave de Stripe queda opcional hasta implementar la sección de pagos.
export const publicEnv = loadPublicEnv({
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});
