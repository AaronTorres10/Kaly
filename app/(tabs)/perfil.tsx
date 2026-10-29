import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { signOut, useAuth } from '@/lib/auth/email';

export default function ProfileScreen() {
  const { user, loading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#214E4A" /></View>;

  async function handleSignOut() {
    setError(null);
    try {
      await signOut();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'No hemos podido cerrar sesión.');
    }
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Tu cuenta';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>TU CUENTA</Text>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.profileCard}>
         <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
         <View><Text style={styles.name}>{displayName}</Text><Text style={styles.email}>{user?.email}</Text></View>
      </View>
       <View style={styles.menu}><Text style={styles.menuItem}>Mis favoritos <Text style={styles.arrow}>›</Text></Text><Text style={styles.menuItem}>Preferencias <Text style={styles.arrow}>›</Text></Text><Text style={styles.menuItem}>Ayuda y soporte <Text style={styles.arrow}>›</Text></Text></View>
       {authError || error ? <Text accessibilityRole="alert" style={styles.error}>{authError ?? error}</Text> : null}
       <Pressable accessibilityRole="button" onPress={() => void handleSignOut()} style={styles.signOut}><Text style={styles.signOutText}>Cerrar sesión</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', backgroundColor: '#FCFBF8', flex: 1, justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#FCFBF8', padding: 24, paddingTop: 64 },
  eyebrow: { color: '#D56D51', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#182322', fontSize: 30, fontWeight: '800', marginTop: 8, marginBottom: 28 },
  profileCard: { backgroundColor: '#214E4A', borderRadius: 22, padding: 22, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#F3C6A8', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { color: '#214E4A', fontSize: 18, fontWeight: '800' },
  name: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  email: { color: '#B8D8D8', fontSize: 13, marginTop: 5 },
  menu: { backgroundColor: '#FFF', borderRadius: 18, marginTop: 20, paddingHorizontal: 18 },
  menuItem: { color: '#263A37', fontSize: 15, fontWeight: '600', paddingVertical: 19, borderBottomColor: '#EEF1EF', borderBottomWidth: 1 },
  arrow: { color: '#D56D51', fontSize: 22 },
  error: { color: '#B33D32', fontSize: 14, marginTop: 16 },
  signOut: { alignItems: 'center', borderColor: '#D56D51', borderRadius: 14, borderWidth: 1, marginTop: 24, padding: 15 },
  signOutText: { color: '#B14F3B', fontSize: 15, fontWeight: '700' },
});
