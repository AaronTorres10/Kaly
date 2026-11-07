import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { ListingCard } from '@/components/listings/ListingCard';
import { FiltersSheet, type SearchFilters } from '@/components/search/FiltersSheet';
import { SearchBar } from '@/components/search/SearchBar';
import { searchListings, type SearchInput } from '@/lib/listings/searchListings';
import type { ListingSummary } from '@/lib/listings/listPublished';
import { useRouter } from 'expo-router';

function ExploreStatus({
  kind,
  onRetry,
  searched = false,
}: {
  kind: 'loading' | 'error' | 'empty';
  onRetry?: () => void;
  searched?: boolean;
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
      <Text style={styles.statusTitle}>{searched ? 'No encontramos alojamientos' : 'Aún no hay alojamientos'}</Text>
      <Text style={styles.statusText}>{searched ? 'Prueba con otro destino o limpia algunos filtros.' : 'Prueba de nuevo más tarde para descubrir nuevos lugares.'}</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [destination, setDestination] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [appliedSearch, setAppliedSearch] = useState<SearchInput>({});
  const [filtersVisible, setFiltersVisible] = useState(false);

  const loadListings = useCallback(async (input: SearchInput = {}) => {
    setLoading(true);
    setError(false);
    try {
      setListings(await searchListings(input));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const submitSearch = useCallback((nextFilters: SearchFilters = filters) => {
    const nextSearch: SearchInput = {
      ...nextFilters,
      destination: destination.trim() || undefined,
    };
    setFilters(nextFilters);
    setAppliedSearch(nextSearch);
    void loadListings(nextSearch);
  }, [destination, filters, loadListings]);

  const clearFilters = useCallback(() => {
    setDestination('');
    setFilters({});
    setAppliedSearch({});
    setFiltersVisible(false);
    void loadListings({});
  }, [loadListings]);

  const activeFilterCount = useMemo(() => {
    return [
      filters.checkIn && filters.checkOut,
      filters.guests !== undefined,
      filters.minPrice !== undefined,
      filters.maxPrice !== undefined,
    ].filter(Boolean).length + (filters.amenities?.length ?? 0);
  }, [filters]);

  const chips = useMemo(() => {
    const values: string[] = [];
    if (appliedSearch.destination) values.push(`Destino: ${appliedSearch.destination}`);
    if (appliedSearch.checkIn && appliedSearch.checkOut) values.push(`${appliedSearch.checkIn} → ${appliedSearch.checkOut}`);
    if (appliedSearch.guests) values.push(`${appliedSearch.guests} huéspedes`);
    if (appliedSearch.minPrice !== undefined || appliedSearch.maxPrice !== undefined) {
      values.push(`$${appliedSearch.minPrice ?? 0}–$${appliedSearch.maxPrice ?? '∞'}`);
    }
    if (appliedSearch.amenities?.length) values.push(appliedSearch.amenities.join(' · '));
    return values;
  }, [appliedSearch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>DESCUBRE KALY</Text>
        <Text style={styles.title}>Encuentra tu próximo lugar</Text>
        <Text style={styles.subtitle}>Alojamientos seleccionados para tu siguiente escapada.</Text>

        <SearchBar
          activeFilterCount={activeFilterCount}
          onChangeText={setDestination}
          onOpenFilters={() => setFiltersVisible(true)}
          onSubmit={() => submitSearch()}
          value={destination}
        />

        {chips.length > 0 ? (
          <View accessibilityLabel="Filtros activos" style={styles.chips}>
            {chips.map((chip) => <View key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>)}
            <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchText}>Limpiar</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alojamientos publicados</Text>
          {!loading && !error ? <Text style={styles.resultCount}>{listings.length} lugares</Text> : null}
        </View>

        {loading ? <ExploreStatus kind="loading" /> : null}
        {!loading && error ? <ExploreStatus kind="error" onRetry={() => void loadListings(appliedSearch)} /> : null}
        {!loading && !error && listings.length === 0 ? <ExploreStatus kind="empty" searched={Object.keys(appliedSearch).length > 0} /> : null}
        {!loading && !error ? listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onPress={() => router.push(`/listings/${listing.id}` as never)}
          />
        )) : null}
      </ScrollView>
      <FiltersSheet
        initialFilters={filters}
        onApply={(nextFilters) => {
          setFiltersVisible(false);
          submitSearch(nextFilters);
        }}
        onClear={clearFilters}
        onClose={() => setFiltersVisible(false)}
        visible={filtersVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.light.background, flex: 1 },
  container: { padding: 22, paddingBottom: 32 },
  eyebrow: { color: Colors.light.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: Colors.light.text, fontSize: 29, fontWeight: '800', lineHeight: 35, marginTop: 8 },
  subtitle: { color: Colors.light.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 26, marginTop: 9 },
  chip: { backgroundColor: Colors.light.soft, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  chipText: { color: Colors.light.primary, fontSize: 11, fontWeight: '700' },
  clearSearchButton: { justifyContent: 'center', paddingHorizontal: 5 },
  clearSearchText: { color: Colors.light.accent, fontSize: 11, fontWeight: '800' },
  sectionHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: Colors.light.text, fontSize: 19, fontWeight: '800' },
  resultCount: { color: Colors.light.muted, fontSize: 12 },
  status: { alignItems: 'center', backgroundColor: Colors.light.soft, borderRadius: 20, justifyContent: 'center', minHeight: 170, padding: 24 },
  statusTitle: { color: Colors.light.primary, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  statusText: { color: '#55716D', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  retryButton: { backgroundColor: Colors.light.primary, borderRadius: 12, marginTop: 16, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: Colors.light.surface, fontSize: 14, fontWeight: '800' },
});
