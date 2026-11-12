import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '../../constants/Colors';
import type { HostListingSummary } from '../../lib/host/listMyListings';

type HostListingCardProps = {
  listing: HostListingSummary;
  onEdit: () => void;
  onPhotos: () => void;
};

const priceFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });

export function HostListingCard({ listing, onEdit, onPhotos }: HostListingCardProps) {
  return (
    <View style={styles.card}>
      {listing.coverImageUrl ? (
        <Image accessibilityLabel={`Foto de ${listing.title}`} source={{ uri: listing.coverImageUrl }} style={styles.image} />
      ) : (
        <View accessibilityLabel="Este alojamiento no tiene fotos" style={styles.placeholder}>
          <Text style={styles.placeholderText}>Sin fotos</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text numberOfLines={1} style={styles.title}>{listing.title}</Text>
            <Text numberOfLines={1} style={styles.location}>{listing.location}</Text>
          </View>
          <Text style={[styles.status, listing.isPublished ? styles.published : styles.draft]}>
            {listing.isPublished ? 'Publicada' : 'Borrador'}
          </Text>
        </View>
        <Text style={styles.meta}>${priceFormatter.format(listing.pricePerNight)} / noche · Hasta {listing.capacity} huéspedes</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${listing.title}`} onPress={onEdit} style={styles.actionButton}>
            <Text style={styles.actionText}>Editar publicación</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Gestionar fotos de ${listing.title}`} onPress={onPhotos} style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>Fotos</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.light.surface, borderRadius: 20, marginBottom: 16, overflow: 'hidden' },
  image: { backgroundColor: Colors.light.soft, height: 150, width: '100%' },
  placeholder: { alignItems: 'center', backgroundColor: Colors.light.soft, height: 150, justifyContent: 'center' },
  placeholderText: { color: Colors.light.muted, fontWeight: '700' },
  content: { padding: 16 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  titleBlock: { flex: 1, marginRight: 12 },
  title: { color: Colors.light.text, fontSize: 17, fontWeight: '800' },
  location: { color: Colors.light.muted, fontSize: 13, marginTop: 5 },
  status: { borderRadius: 10, fontSize: 11, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 },
  published: { backgroundColor: Colors.light.soft, color: Colors.light.primary },
  draft: { backgroundColor: '#F8E8E2', color: Colors.light.accent },
  meta: { color: Colors.light.muted, fontSize: 13, marginTop: 14 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionButton: { backgroundColor: Colors.light.primary, borderRadius: 10, flex: 1, padding: 11 },
  actionText: { color: Colors.light.surface, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  secondaryAction: { borderColor: Colors.light.primary, borderRadius: 10, borderWidth: 1, padding: 11 },
  secondaryText: { color: Colors.light.primary, fontSize: 12, fontWeight: '700' },
});
