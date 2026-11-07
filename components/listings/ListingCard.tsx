import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '../../constants/Colors';
import type { ListingSummary } from '../../lib/listings/types';

type ListingCardProps = {
  listing: ListingSummary;
  onPress: () => void;
};

const priceFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 0,
});

export function ListingCard({ listing, onPress }: ListingCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir alojamiento ${listing.title}`}
      onPress={onPress}
      style={styles.card}>
      <View style={styles.imageContainer}>
        {listing.coverImageUrl ? (
          <Image accessibilityLabel={`Foto de ${listing.title}`} source={{ uri: listing.coverImageUrl }} style={styles.image} />
        ) : (
          <View accessibilityLabel="Este alojamiento no tiene fotos" style={styles.placeholder}>
            <Text style={styles.placeholderText}>Sin foto</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>{listing.title}</Text>
        <Text numberOfLines={1} style={styles.location}>{listing.location}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>${priceFormatter.format(listing.pricePerNight)} <Text style={styles.perNight}>/ noche</Text></Text>
          <Text style={styles.capacity}>Hasta {listing.capacity} huéspedes</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  imageContainer: { backgroundColor: Colors.light.soft, height: 180 },
  image: { height: '100%', width: '100%' },
  placeholder: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  placeholderText: { color: Colors.light.muted, fontSize: 15, fontWeight: '700' },
  content: { padding: 16 },
  title: { color: Colors.light.text, fontSize: 18, fontWeight: '800' },
  location: { color: Colors.light.muted, fontSize: 13, marginTop: 6 },
  metaRow: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  price: { color: Colors.light.accent, fontSize: 16, fontWeight: '800' },
  perNight: { color: Colors.light.muted, fontSize: 12, fontWeight: '500' },
  capacity: { color: Colors.light.primary, fontSize: 12, fontWeight: '700' },
});
