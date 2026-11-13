import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '../../constants/Colors';
import {
  deleteListingImage,
  LISTING_IMAGES_BUCKET,
  type ListingImage,
  reorderListingImages,
  uploadListingImage,
  type ImageAsset,
} from '../../lib/host/uploadListingImage';
import { supabase } from '../../lib/supabase';

type ListingPhotoManagerProps = { listingId: string };

function rowToImage(row: Record<string, unknown>): ListingImage {
  const path = row.storage_path ? String(row.storage_path) : '';
  const url = path ? supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl : String(row.source_url ?? '');
  return {
    id: String(row.id), listingId: String(row.listing_id), storagePath: path || null,
    sourceUrl: row.source_url ? String(row.source_url) : null, license: row.license ? String(row.license) : null,
    attribution: row.attribution ? String(row.attribution) : null, position: Number(row.position ?? 0), url,
  };
}

export function ListingPhotoManager({ listingId }: ListingPhotoManagerProps) {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.from('listing_images').select('*').eq('listing_id', listingId).order('position', { ascending: true }).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError('No hemos podido cargar las fotos.');
      else setImages(((data ?? []) as unknown as Record<string, unknown>[]).map(rowToImage));
      setLoading(false);
    });
    return () => { active = false; };
  }, [listingId]);

  const pickImage = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);
    if (!permission.granted) { setError('Necesitamos permiso para elegir una foto.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.85 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const uploadAsset: ImageAsset = asset;
    setBusy(true);
    try {
      const image = await uploadListingImage(listingId, uploadAsset);
      setImages((current) => [...current, image]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No hemos podido subir la foto.');
    } finally { setBusy(false); }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length || busy) return;
    const next = [...images]; [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    try { await reorderListingImages(listingId, next.map((image) => image.id)); }
    catch { setError('No hemos podido guardar el orden de las fotos.'); }
  };

  const remove = async (image: ListingImage) => {
    setBusy(true); setError(null);
    try { await deleteListingImage(listingId, image.id); setImages((current) => current.filter((item) => item.id !== image.id)); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'No hemos podido borrar la foto.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Fotos de la publicación</Text>
      <Text style={styles.help}>Añade fotos propias del alojamiento desde la galería de tu teléfono.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Añadir foto" disabled={busy} onPress={() => void pickImage()} style={[styles.button, busy && styles.disabled]}><Text style={styles.buttonText}>{busy ? 'Procesando…' : 'Elegir foto'}</Text></Pressable>
      {loading ? <ActivityIndicator color={Colors.light.primary} /> : null}
      {images.length === 0 && !loading ? <Text style={styles.empty}>Todavía no hay fotos. La publicación puede guardarse sin fotos.</Text> : null}
      {images.map((image, index) => (
        <View key={image.id} style={styles.photoRow}>
          <Image source={{ uri: image.url }} style={styles.preview} accessibilityLabel={`Foto ${index + 1}`} />
          <View style={styles.photoActions}>
            <Text style={styles.attribution} numberOfLines={2}>{image.attribution ?? 'Sin atribución'}</Text>
            <View style={styles.actionRow}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Subir foto ${index + 1}`} disabled={index === 0 || busy} onPress={() => void move(index, -1)}><Text style={styles.action}>↑</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Bajar foto ${index + 1}`} disabled={index === images.length - 1 || busy} onPress={() => void move(index, 1)}><Text style={styles.action}>↓</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Borrar foto ${index + 1}`} disabled={busy} onPress={() => void remove(image)}><Text style={styles.delete}>Borrar</Text></Pressable>
            </View>
          </View>
        </View>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.light.background, padding: 24 },
  heading: { color: Colors.light.text, fontSize: 20, fontWeight: '800' },
  help: { color: Colors.light.muted, fontSize: 13, marginTop: 6 },
  input: { backgroundColor: Colors.light.surface, borderColor: '#D5E1DD', borderRadius: 12, borderWidth: 1, color: Colors.light.text, marginTop: 12, minHeight: 46, paddingHorizontal: 14 },
  button: { alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 12, marginTop: 14, padding: 14 },
  disabled: { opacity: 0.6 },
  buttonText: { color: Colors.light.surface, fontWeight: '800' },
  empty: { color: Colors.light.muted, marginTop: 18 },
  photoRow: { alignItems: 'center', borderBottomColor: '#D5E1DD', borderBottomWidth: 1, flexDirection: 'row', gap: 14, paddingVertical: 14 },
  preview: { backgroundColor: Colors.light.soft, borderRadius: 10, height: 92, width: 92 },
  photoActions: { flex: 1 },
  attribution: { color: Colors.light.muted, fontSize: 12 },
  actionRow: { alignItems: 'center', flexDirection: 'row', gap: 16, marginTop: 10 },
  action: { color: Colors.light.primary, fontSize: 24, fontWeight: '800' },
  delete: { color: '#B54735', fontWeight: '700' },
  error: { color: '#B54735', marginTop: 14 },
});
