import { describe, expect, it, vi } from 'vitest';

describe('configuración de la aplicación', () => {
  it('expone solo la configuración pública necesaria para arrancar', async () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'private-service-role-key';
    process.env.STRIPE_SECRET_KEY = 'private-stripe-key';

    const { publicEnv } = await import('../lib/env');

    expect(publicEnv).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'public-anon-key',
      stripePublishableKey: undefined,
    });
    expect(publicEnv).not.toHaveProperty('serviceRoleKey');
    expect(publicEnv).not.toHaveProperty('stripeSecretKey');
  });

  it('rechaza una configuración Supabase incompleta', async () => {
    vi.resetModules();
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

    await expect(import('../lib/env')).rejects.toThrow(
      'Falta la variable de entorno pública EXPO_PUBLIC_SUPABASE_URL',
    );
  });
});
