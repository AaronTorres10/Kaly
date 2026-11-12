import { StyleSheet, Text, View } from 'react-native';

import Colors from '../../constants/Colors';
import type { ListingDetail as ListingDetailData } from '../../lib/listings/getListingDetail';

type ListingDetailProps = {
  listing: ListingDetailData;
};

const priceFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });

export function ListingDetail({ listing }: ListingDetailProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.location}>{listing.location}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.price}>${priceFormatter.format(listing.pricePerNight)} <Text style={styles.perNight}>/ noche</Text></Text>
        <Text style={styles.capacity}>Hasta {listing.capacity} huéspedes</Text>
      </View>

      <Text style={styles.sectionTitle}>Sobre este alojamiento</Text>
      <Text style={styles.description}>{listing.description}</Text>

      <Text style={styles.sectionTitle}>Servicios</Text>
      {listing.amenities.length > 0 ? (
        <View style={styles.amenities}>
          {listing.amenities.map((amenity) => <Text key={amenity} style={styles.amenity}>• {amenity}</Text>)}
        </View>
      ) : <Text style={styles.muted}>El anfitrión aún no ha indicado servicios.</Text>}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 40 },
  title: { color: Colors.light.text, fontSize: 29, fontWeight: '800', marginTop: 22 },
  location: { color: Colors.light.muted, fontSize: 15, marginTop: 7 },
  metaRow: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  price: { color: Colors.light.accent, fontSize: 20, fontWeight: '800' },
  perNight: { color: Colors.light.muted, fontSize: 13, fontWeight: '500' },
  capacity: { color: Colors.light.primary, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: Colors.light.text, fontSize: 19, fontWeight: '800', marginTop: 28 },
  description: { color: Colors.light.text, fontSize: 15, lineHeight: 23, marginTop: 9 },
  amenities: { gap: 8, marginTop: 10 },
  amenity: { color: Colors.light.text, fontSize: 15 },
  muted: { color: Colors.light.muted, fontSize: 15, marginTop: 10 },
});
