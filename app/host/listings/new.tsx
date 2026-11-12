import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '../../../constants/Colors';
import { ListingForm } from '../../../components/host/ListingForm';
import { saveListing } from '../../../lib/host/saveListing';

export default function NewListingScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Nueva publicación</Text><View style={styles.spacer} /></View>
      <ListingForm onSubmit={async (input) => { await saveListing(input); Alert.alert('Publicación guardada', 'Tu alojamiento está listo.'); router.replace('/host'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.light.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 58 },
  back: { color: Colors.light.primary, fontSize: 36, lineHeight: 36 },
  title: { color: Colors.light.text, fontSize: 22, fontWeight: '800' },
  spacer: { width: 24 },
});
