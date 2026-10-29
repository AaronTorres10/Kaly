import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type User } from '@supabase/supabase-js';
import { createContext, createElement, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { publicEnv } from '../env';

export type AuthResult = {
  ok: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
};

export const supabase = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: AsyncStorage,
  },
});

const MIN_PASSWORD_LENGTH = 8;

function validateCredentials(email: string, password: string): string | undefined {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Introduce un correo electrónico válido.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
}

function translateAuthError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'El correo o la contraseña no son correctos.';
  }
  if (normalizedMessage.includes('already registered') || normalizedMessage.includes('already exists')) {
    return 'Ya existe una cuenta con este correo.';
  }
  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirma tu correo electrónico antes de entrar.';
  }
  if (normalizedMessage.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
  }

  return 'No hemos podido completar la autenticación. Inténtalo de nuevo.';
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const validationError = validateCredentials(email, password);
  if (validationError) return { ok: false, error: validationError };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true, session: data.session, user: data.user };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const validationError = validateCredentials(email, password);
  if (validationError) return { ok: false, error: validationError };

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true, session: data.session, user: data.user };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(translateAuthError(error.message));
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(translateAuthError(sessionError.message));
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { session, user: session?.user ?? null, loading, error } },
    children,
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
