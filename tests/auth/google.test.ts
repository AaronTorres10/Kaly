import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  setSession: vi.fn(),
  signInWithOAuth: vi.fn(),
}));

const openAuthSessionAsync = vi.hoisted(() => vi.fn());
const makeRedirectUri = vi.hoisted(() => vi.fn(() => 'kaly://auth/callback'));
const expoConstants = vi.hoisted(() => ({ appOwnership: null as string | null }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth })),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

vi.mock('expo-auth-session', () => ({ makeRedirectUri }));
vi.mock('expo-constants', () => ({ default: expoConstants }));
vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync,
}));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

describe('autenticación con Google', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    expoConstants.appOwnership = null;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.co/auth/v1/authorize?provider=google' },
      error: null,
    });
  });

  async function loadSignIn() {
    return (await import('../../lib/auth/google')).signInWithGoogle;
  }

  it('configura el redirect nativo exacto y traduce la cancelación', async () => {
    openAuthSessionAsync.mockResolvedValue({ type: 'cancel' });
    const signInWithGoogle = await loadSignIn();

    await expect(signInWithGoogle()).resolves.toEqual({
      ok: false,
      error: 'Has cancelado el acceso con Google.',
    });
    expect(makeRedirectUri).toHaveBeenCalledWith({
      native: 'kaly://auth/callback',
      path: 'auth/callback',
      scheme: 'kaly',
    });
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'kaly://auth/callback', skipBrowserRedirect: true },
    });
  });

  it('usa el deep link exp:// cuando se ejecuta dentro de Expo Go', async () => {
    expoConstants.appOwnership = 'expo';
    openAuthSessionAsync.mockResolvedValue({ type: 'cancel' });
    const signInWithGoogle = await loadSignIn();

    await signInWithGoogle();

    expect(makeRedirectUri).toHaveBeenCalledWith({ path: 'auth/callback', scheme: 'kaly' });
    expect(makeRedirectUri).not.toHaveBeenCalledWith(expect.objectContaining({ native: 'kaly://auth/callback' }));
  });

  it('rechaza un callback sin código ni tokens', async () => {
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'kaly://auth/callback?state=valid',
    });
    const signInWithGoogle = await loadSignIn();

    await expect(signInWithGoogle()).resolves.toEqual({
      ok: false,
      error: 'Google no devolvió una autorización válida.',
    });
    expect(auth.setSession).not.toHaveBeenCalled();
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('traduce el error devuelto por el proveedor', async () => {
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'kaly://auth/callback?error=access_denied',
    });
    const signInWithGoogle = await loadSignIn();

    await expect(signInWithGoogle()).resolves.toEqual({
      ok: false,
      error: 'Google no ha autorizado el acceso. Inténtalo de nuevo.',
    });
  });

  it('persiste una sesión recibida sin escribir tokens en logs', async () => {
    const session = { access_token: 'access-token', refresh_token: 'refresh-token' };
    const user = { id: 'user-1', email: 'ana@example.com' };
    auth.setSession.mockResolvedValue({ data: { session, user }, error: null });
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'kaly://auth/callback#access_token=access-token&refresh_token=refresh-token',
    });
    const log = vi.spyOn(console, 'log');
    const signInWithGoogle = await loadSignIn();

    await expect(signInWithGoogle()).resolves.toEqual({ ok: true, session, user });
    expect(auth.setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('canjea un callback con código y no expone el código', async () => {
    const session = { access_token: 'access-token' };
    const user = { id: 'user-1' };
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session, user }, error: null });
    openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'kaly://auth/callback?code=one-time-code',
    });
    const error = vi.spyOn(console, 'error');
    const signInWithGoogle = await loadSignIn();

    await expect(signInWithGoogle()).resolves.toEqual({ ok: true, session, user });
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('one-time-code');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
