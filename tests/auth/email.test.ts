import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth })),
}));

let signInWithEmail: typeof import('../../lib/auth/email').signInWithEmail;
let signOut: typeof import('../../lib/auth/email').signOut;
let signUpWithEmail: typeof import('../../lib/auth/email').signUpWithEmail;

describe('autenticación con correo', () => {
  beforeAll(async () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    const module = await import('../../lib/auth/email');
    signInWithEmail = module.signInWithEmail;
    signOut = module.signOut;
    signUpWithEmail = module.signUpWithEmail;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida el correo antes de llamar a Supabase', async () => {
    await expect(signInWithEmail('no-es-un-correo', 'password123')).resolves.toEqual({
      ok: false,
      error: 'Introduce un correo electrónico válido.',
    });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('rechaza contraseñas cortas', async () => {
    await expect(signUpWithEmail('ana@example.com', 'corta')).resolves.toEqual({
      ok: false,
      error: 'La contraseña debe tener al menos 8 caracteres.',
    });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('traduce credenciales inválidas', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(signInWithEmail('ana@example.com', 'password123')).resolves.toEqual({
      ok: false,
      error: 'El correo o la contraseña no son correctos.',
    });
  });

  it('devuelve la sesión iniciada con el contrato AuthResult', async () => {
    const session = { access_token: 'token-de-prueba' };
    const user = { id: 'user-1', email: 'ana@example.com' };
    auth.signInWithPassword.mockResolvedValue({ data: { session, user }, error: null });

    await expect(signInWithEmail(' ana@example.com ', 'password123')).resolves.toEqual({
      ok: true,
      session,
      user,
    });
  });

  it('registra una cuenta y cierra sesión', async () => {
    auth.signUp.mockResolvedValue({
      data: { session: null, user: { id: 'user-2', email: 'ana@example.com' } },
      error: null,
    });

    await expect(signUpWithEmail('ana@example.com', 'password123')).resolves.toMatchObject({
      ok: true,
      user: { id: 'user-2' },
    });

    auth.signOut.mockResolvedValue({ error: null });
    await expect(signOut()).resolves.toBeUndefined();
    expect(auth.signOut).toHaveBeenCalledOnce();
  });
});
