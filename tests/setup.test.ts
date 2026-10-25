import { describe, expect, it } from 'vitest';

import { loadPublicEnv } from '../lib/env';

describe('configuración pública de la aplicación', () => {
  it('acepta Supabase sin exigir todavía una clave de Stripe', () => {
    expect(
      loadPublicEnv({
        supabaseUrl: 'https://example.supabase.co',
        supabaseAnonKey: 'public-anon-key',
      }),
    ).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'public-anon-key',
      stripePublishableKey: undefined,
    });
  });

  it('rechaza una configuración pública de Supabase incompleta sin revelar secretos', () => {
    expect(() =>
      loadPublicEnv({
        supabaseUrl: '',
        supabaseAnonKey: '',
      }),
    ).toThrow(/EXPO_PUBLIC_SUPABASE_URL.*EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it('no exporta claves privadas ni las incluye en el objeto público', async () => {
    const moduleExports = await import('../lib/env');

    expect(moduleExports).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY');
    expect(moduleExports).not.toHaveProperty('STRIPE_SECRET_KEY');
    expect(JSON.stringify(moduleExports)).not.toContain('SERVICE_ROLE');
    expect(JSON.stringify(moduleExports)).not.toContain('STRIPE_SECRET');
  });
});
