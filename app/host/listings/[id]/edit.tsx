import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '../../../../constants/Colors';
import { ListingForm, type ListingFormInput } from '../../../../components/host/ListingForm';
import { ListingPhotoManager } from '../../../../components/host/ListingPhotoManager';
import { saveListing } from '../../../../lib/host/saveListing';
import { supabase } from '../../../../lib/supabase';

type ListingRow = { id: string; title: string; description: string; location: string; price_per_night: number; capacity: number; amenities: string[]; is_published: boolean };

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<ListingFormInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user || !id) { if (active) setError('No hemos podido cargar esta publicación.'); return; }
      const { data, error: listingError } = await supabase.from('listings').select('id, title, description, location, price_per_night, capacity, amenities, is_published').eq('id', id).eq('host_id', userData.user.id).single();
      if (listingError || !data) { if (active) setError('No hemos podido cargar esta publicación.'); return; }
      const row = data as ListingRow;
      if (active) setListing({ id: row.id, title: row.title, description: row.description, location: row.location, pricePerNight: String(row.price_per_night), capacity: String(row.capacity), amenities: row.amenities ?? [], isPublished: row.is_published });
    };
    void load();
    return () => { active = false; };
  }, [id]);

  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  if (!listing || !listing.id) return <View style={styles.center}><ActivityIndicator color={Colors.light.primary} /><Text style={styles.loading}>Cargando publicación…</Text></View>;

  return (
    <View style={styles.screen}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Editar publicación</Text><View style={styles.spacer} /></View>
      <ListingForm initialValues={listing} submitLabel="Guardar cambios" onSubmit={async (input) => { await saveListing({ ...input, id: listing.id }); Alert.alert('Cambios guardados'); router.replace('/host'); }} />
      <ListingPhotoManager listingId={listing.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.light.background, flex: 1 },
  center: { alignItems: 'center', backgroundColor: Colors.light.background, flex: 1, justifyContent: 'center', padding: 24 },
  loading: { color: Colors.light.muted, marginTop: 12 },
  error: { color: '#B54735', textAlign: 'center' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 58 },
  back: { color: Colors.light.primary, fontSize: 36, lineHeight: 36 },
  title: { color: Colors.light.text, fontSize: 22, fontWeight: '800' },
  spacer: { width: 24 },
});
