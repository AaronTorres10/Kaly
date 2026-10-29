import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase, type AuthResult } from './email';

export const GOOGLE_NATIVE_REDIRECT_URI = 'kaly://auth/callback';

WebBrowser.maybeCompleteAuthSession();

function redirectUri(): string {
  if (Platform.OS === 'web') {
    return makeRedirectUri({ path: 'auth/callback', scheme: 'kaly' });
  }

  // Expo Go cannot claim the application's custom scheme. Its generated
  // exp:// URL is the deep link that returns to the running project.
  if (Constants.appOwnership === 'expo') {
    return makeRedirectUri({ path: 'auth/callback', scheme: 'kaly' });
  }

  return makeRedirectUri({
    native: GOOGLE_NATIVE_REDIRECT_URI,
    path: 'auth/callback',
    scheme: 'kaly',
  });
}

function providerError(): AuthResult {
  return { ok: false, error: 'No hemos podido acceder con Google. Inténtalo de nuevo.' };
}

function callbackError(): AuthResult {
  return { ok: false, error: 'Google no devolvió una autorización válida.' };
}

function readCallbackParams(url: string): URLSearchParams {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  for (const [key, value] of new URLSearchParams(parsedUrl.hash.replace(/^#/, ''))) {
    params.set(key, value);
  }

  return params;
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const redirectTo = redirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error || !data.url) return providerError();

  let browserResult: Awaited<ReturnType<typeof WebBrowser.openAuthSessionAsync>>;
  try {
    browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  } catch {
    return providerError();
  }

  if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
    return { ok: false, error: 'Has cancelado el acceso con Google.' };
  }

  if (browserResult.type !== 'success' || !('url' in browserResult) || !browserResult.url) {
    return providerError();
  }

  let params: URLSearchParams;
  try {
    params = readCallbackParams(browserResult.url);
  } catch {
    return callbackError();
  }

  if (params.get('error')) {
    if (params.get('error') === 'access_denied') {
      return { ok: false, error: 'Google no ha autorizado el acceso. Inténtalo de nuevo.' };
    }
    return providerError();
  }

  const code = params.get('code');
  try {
    if (code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      if (result.error) return providerError();
      return { ok: true, session: result.data.session, user: result.data.user };
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return callbackError();

    const result = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (result.error) return providerError();
    return { ok: true, session: result.data.session, user: result.data.user };
  } catch {
    return providerError();
  }
}
