import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import Colors from '../../constants/Colors';
import { buildListingMapHtml, getListingMapState } from './listingMapModel';

type ListingMapProps = {
  latitude: number | null;
  longitude: number | null;
  label: string;
};

export function ListingMap({ latitude, longitude, label }: ListingMapProps) {
  const [hasError, setHasError] = useState(false);
  const unavailable = getListingMapState(latitude, longitude) === 'unavailable' || Platform.OS === 'web' || hasError;

  return (
    <View accessibilityLabel="Mapa del alojamiento" style={styles.container}>
      <Text style={styles.title}>Ubicación aproximada</Text>
      {unavailable ? (
        <View accessibilityRole="text" style={styles.fallback}>
          <Text style={styles.fallbackTitle}>Mapa no disponible</Text>
          <Text style={styles.fallbackText}>No podemos mostrar la ubicación de este alojamiento en este momento.</Text>
        </View>
      ) : (
        <WebView
          accessibilityLabel={`Mapa de ${label}`}
          originWhitelist={['*']}
          onError={() => setHasError(true)}
          source={{ html: buildListingMapHtml({ latitude: latitude as number, longitude: longitude as number, label }) }}
          style={styles.map}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 26 },
  title: { color: Colors.light.text, fontSize: 19, fontWeight: '800', marginBottom: 10 },
  map: { borderRadius: 14, height: 220, overflow: 'hidden' },
  fallback: { backgroundColor: Colors.light.surface, borderRadius: 14, padding: 22 },
  fallbackTitle: { color: Colors.light.text, fontSize: 16, fontWeight: '800' },
  fallbackText: { color: Colors.light.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
});
