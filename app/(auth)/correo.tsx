import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { signInWithEmail, signUpWithEmail, useAuth } from '@/lib/auth/email';

export default function EmailAuthScreen() {
  const { session } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) router.replace('/');
  }, [session]);

  if (session) return null;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const result = isRegistering
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'No hemos podido acceder.');
      return;
    }
    if (!result.session) {
      setError('Revisa tu correo para confirmar la cuenta antes de entrar.');
      return;
    }
    router.replace('/');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>BIENVENIDO A KALY</Text>
        <Text style={styles.title}>{isRegistering ? 'Crea tu cuenta' : 'Vuelve a descubrir'}</Text>
        <Text style={styles.subtitle}>Accede a tus reservas y encuentra tu próximo alojamiento.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor="#8B9995" style={styles.input} value={email} />
          <Text style={styles.label}>Contraseña</Text>
          <TextInput autoCapitalize="none" autoComplete="password" onChangeText={setPassword} placeholder="Mínimo 8 caracteres" placeholderTextColor="#8B9995" secureTextEntry style={styles.input} value={password} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void handleSubmit()} style={styles.button}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{isRegistering ? 'Registrarme' : 'Entrar'}</Text>}
          </Pressable>
          <Pressable onPress={() => { setError(null); setIsRegistering((value) => !value); }} style={styles.switchButton}>
            <Text style={styles.switchText}>{isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFBF8' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  eyebrow: { color: '#D56D51', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#182322', fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#5D6C68', fontSize: 16, lineHeight: 24, marginTop: 12 },
  form: { marginTop: 36 },
  label: { color: '#263A37', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#DDE5E1', borderRadius: 14, borderWidth: 1, color: '#182322', fontSize: 16, padding: 16 },
  error: { color: '#B33D32', fontSize: 14, lineHeight: 20, marginTop: 14 },
  button: { alignItems: 'center', backgroundColor: '#214E4A', borderRadius: 14, justifyContent: 'center', marginTop: 24, minHeight: 54 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  switchButton: { alignItems: 'center', padding: 18 },
  switchText: { color: '#D56D51', fontSize: 15, fontWeight: '700' },
});
