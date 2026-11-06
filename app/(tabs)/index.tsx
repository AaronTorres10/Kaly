import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { ListingCard } from '@/components/listings/ListingCard';
import { listPublishedListings, type ListingSummary } from '@/lib/listings/listPublished';
import { useRouter } from 'expo-router';

function ExploreStatus({
  kind,
  onRetry,
}: {
  kind: 'loading' | 'error' | 'empty';
  onRetry?: () => void;
}) {
  if (kind === 'loading') {
    return <View accessibilityLabel="Cargando alojamientos" style={styles.status}><ActivityIndicator color={Colors.light.primary} /><Text style={styles.statusText}>Buscando alojamientos...</Text></View>;
  }

  if (kind === 'error') {
    return (
      <View accessibilityRole="alert" style={styles.status}>
        <Text style={styles.statusTitle}>No pudimos cargar los alojamientos</Text>
        <Text style={styles.statusText}>Revisa tu conexión e inténtalo de nuevo.</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.status}>
      <Text style={styles.statusTitle}>Aún no hay alojamientos</Text>
      <Text style={styles.statusText}>Prueba de nuevo más tarde para descubrir nuevos lugares.</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setListings(await listPublishedListings({}));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>DESCUBRE KALY</Text>
        <Text style={styles.title}>Encuentra tu próximo lugar</Text>
        <Text style={styles.subtitle}>Alojamientos seleccionados para tu siguiente escapada.</Text>

        <View style={styles.searchHint}>
          <Text style={styles.searchIcon}>⌕</Text>
          <View>
            <Text style={styles.searchLabel}>¿A dónde vas?</Text>
            <Text style={styles.searchValue}>Explora destinos únicos</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alojamientos publicados</Text>
          {!loading && !error ? <Text style={styles.resultCount}>{listings.length} lugares</Text> : null}
        </View>

        {loading ? <ExploreStatus kind="loading" /> : null}
        {!loading && error ? <ExploreStatus kind="error" onRetry={() => void loadListings()} /> : null}
        {!loading && !error && listings.length === 0 ? <ExploreStatus kind="empty" /> : null}
        {!loading && !error ? listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onPress={() => router.push(`/listings/${listing.id}` as never)}
          />
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.light.background, flex: 1 },
  container: { padding: 22, paddingBottom: 32 },
  eyebrow: { color: Colors.light.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: Colors.light.text, fontSize: 29, fontWeight: '800', lineHeight: 35, marginTop: 8 },
  subtitle: { color: Colors.light.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  searchHint: { alignItems: 'center', backgroundColor: Colors.light.surface, borderRadius: 18, elevation: 2, flexDirection: 'row', marginBottom: 30, marginTop: 22, padding: 17, shadowColor: Colors.light.primary, shadowOpacity: 0.08, shadowRadius: 16 },
  searchIcon: { color: Colors.light.accent, fontSize: 30, lineHeight: 31, marginRight: 13 },
  searchLabel: { color: Colors.light.text, fontSize: 15, fontWeight: '700' },
  searchValue: { color: Colors.light.muted, fontSize: 12, marginTop: 4 },
  sectionHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: Colors.light.text, fontSize: 19, fontWeight: '800' },
  resultCount: { color: Colors.light.muted, fontSize: 12 },
  status: { alignItems: 'center', backgroundColor: Colors.light.soft, borderRadius: 20, justifyContent: 'center', minHeight: 170, padding: 24 },
  statusTitle: { color: Colors.light.primary, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  statusText: { color: '#55716D', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  retryButton: { backgroundColor: Colors.light.primary, borderRadius: 12, marginTop: 16, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: Colors.light.surface, fontSize: 14, fontWeight: '800' },
});
