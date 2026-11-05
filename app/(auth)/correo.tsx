import { router } from 'expo-router';
import { Path, Svg } from 'react-native-svg';
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
        <Text style={styles.eyebrow}>BIENVENIDO A HOSPEDAJES KALY</Text>
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
           <Pressable accessibilityRole="button" onPress={() => router.push('/google')} style={styles.googleButton}>
             <Svg accessibilityLabel="Google" height={18} viewBox="0 0 48 48" width={18}>
               <Path fill="#4285F4" d="M47.9 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.4c-.6 2.8-2.2 5.2-4.7 6.8v5.6h7.6c4.4-4.1 7.6-10.1 7.6-16.4Z" />
               <Path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.6-5.6c-2.1 1.4-4.8 2.3-7.9 2.3-6.1 0-11.3-4.1-13.2-9.7H3v5.8C6.9 42.1 14.8 48 24 48Z" />
               <Path fill="#FBBC05" d="M10.8 29.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H3C1.1 18.4 0 21.1 0 25s1.1 6.6 3 10.1l7.8-5.8Z" />
               <Path fill="#EA4335" d="M24 9.6c3.4 0 6.4 1.2 8.8 3.5l6.6-6.6C35.6 2.4 30.3 0 24 0 14.8 0 6.9 5.9 3 14.9l7.8 5.8C12.7 13.7 17.9 9.6 24 9.6Z" />
             </Svg>
             <Text style={styles.googleText}>Continuar con Google</Text>
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
  googleButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#747775', borderRadius: 4, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 8, minHeight: 48, paddingHorizontal: 16 },
  googleText: { color: '#1F1F1F', fontSize: 14, fontWeight: '500', marginLeft: 12 },
});
