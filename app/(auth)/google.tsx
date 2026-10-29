import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { signInWithGoogle } from '@/lib/auth/google';

export default function GoogleAuthScreen() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    const result = await signInWithGoogle();
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'No hemos podido acceder.');
      return;
    }
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ACCESO SEGURO</Text>
      <Text style={styles.title}>Entra con Google</Text>
      <Text style={styles.subtitle}>Usa tu cuenta de Google para acceder a tus reservas y alojamientos.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void handleGoogleSignIn()} style={styles.button}>
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Continuar con Google</Text>}
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/correo')} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Volver al acceso con correo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FCFBF8', flex: 1, justifyContent: 'center', padding: 28 },
  eyebrow: { color: '#D56D51', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#182322', fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#5D6C68', fontSize: 16, lineHeight: 24, marginTop: 12 },
  error: { color: '#B33D32', fontSize: 14, lineHeight: 20, marginTop: 20 },
  button: { alignItems: 'center', backgroundColor: '#214E4A', borderRadius: 14, justifyContent: 'center', marginTop: 28, minHeight: 54 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', padding: 18 },
  secondaryText: { color: '#D56D51', fontSize: 15, fontWeight: '700' },
});
