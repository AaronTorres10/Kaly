import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { ListingDetail } from '@/components/listings/ListingDetail';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { getListingDetail, type ListingDetail as ListingDetailData } from '@/lib/listings/getListingDetail';

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [listing, setListing] = useState<ListingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListing = useCallback(async () => {
    if (!id) {
      setError('No encontramos el alojamiento solicitado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setListing(await getListingDetail(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cargar el alojamiento.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadListing(); }, [loadListing]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Volver" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Detalle</Text>
      </View>

      {loading ? (
        <View accessibilityLabel="Cargando alojamiento" style={styles.state}>
          <ActivityIndicator color={Colors.light.primary} />
          <Text style={styles.stateText}>Cargando alojamiento...</Text>
        </View>
      ) : error ? (
        <View accessibilityRole="alert" style={styles.state}>
          <Text style={styles.stateTitle}>No pudimos cargar este alojamiento</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void loadListing()} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : listing ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ListingGallery images={listing.images} />
          <ListingDetail listing={listing} onChooseDates={() => {}} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.light.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { alignItems: 'center', height: 42, justifyContent: 'center', width: 42 },
  backText: { color: Colors.light.primary, fontSize: 38, fontWeight: '300', lineHeight: 40 },
  headerTitle: { color: Colors.light.text, fontSize: 17, fontWeight: '800', marginLeft: 6 },
  state: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  stateTitle: { color: Colors.light.primary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  stateText: { color: Colors.light.muted, fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center' },
  retryButton: { backgroundColor: Colors.light.primary, borderRadius: 12, marginTop: 18, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: Colors.light.surface, fontSize: 14, fontWeight: '800' },
});
