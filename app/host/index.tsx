import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '../../constants/Colors';
import { useAuth } from '../../lib/auth/email';
import { listMyListings, type HostListingSummary } from '../../lib/host/listMyListings';
import { HostListingCard } from '../../components/host/HostListingCard';

export default function HostIndex() {
  const router = useRouter();
  const { session } = useAuth();
  const [listings, setListings] = useState<HostListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setListings(await listMyListings());
    } catch {
      setError('No hemos podido cargar tus publicaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) void loadListings();
    else setLoading(false);
  }, [loadListings, session]);

  if (!session) {
    return <View style={styles.center}><Text style={styles.title}>Inicia sesión para administrar tus alojamientos.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>TU ESPACIO</Text>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Anfitrión</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Crear publicación" onPress={() => router.push('/host/listings/new' as never)} style={styles.createButton}>
          <Text style={styles.createText}>＋ Crear</Text>
        </Pressable>
      </View>
      {loading ? <View style={styles.state}><ActivityIndicator color={Colors.light.primary} /><Text style={styles.stateText}>Cargando tus publicaciones…</Text></View> : null}
      {!loading && error ? <View style={styles.state}><Text style={styles.stateText}>{error}</Text><Pressable onPress={() => void loadListings()} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable></View> : null}
      {!loading && !error && listings.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Aún no tienes publicaciones</Text><Text style={styles.emptyText}>Crea tu primer alojamiento y empieza a recibir huéspedes.</Text></View> : null}
      {!loading && !error ? listings.map((listing) => <HostListingCard key={listing.id} listing={listing} onEdit={() => router.push(`/host/listings/${listing.id}/edit` as never)} onPhotos={() => router.push(`/host/listings/${listing.id}/edit?section=photos` as never)} />) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Ver reservas recibidas" onPress={() => router.push('/host/reservations' as never)} style={styles.reservationsLink}>
        <Text style={styles.reservationsText}>Ver reservas recibidas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.light.background, flexGrow: 1, padding: 24, paddingTop: 64 },
  center: { alignItems: 'center', backgroundColor: Colors.light.background, flex: 1, justifyContent: 'center', padding: 32 },
  eyebrow: { color: Colors.light.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, marginTop: 8 },
  title: { color: Colors.light.text, fontSize: 30, fontWeight: '800' },
  createButton: { backgroundColor: Colors.light.accent, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  createText: { color: Colors.light.surface, fontSize: 13, fontWeight: '800' },
  state: { alignItems: 'center', paddingVertical: 48 },
  stateText: { color: Colors.light.muted, marginTop: 12, textAlign: 'center' },
  retry: { marginTop: 16, padding: 10 },
  retryText: { color: Colors.light.accent, fontWeight: '800' },
  empty: { backgroundColor: Colors.light.soft, borderRadius: 18, padding: 24 },
  emptyTitle: { color: Colors.light.primary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: Colors.light.muted, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  reservationsLink: { alignSelf: 'center', padding: 14 },
  reservationsText: { color: Colors.light.primary, fontSize: 14, fontWeight: '800' },
});
