import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

export default function HostScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>TU ESPACIO</Text>
      <Text style={styles.title}>Anfitrión</Text>
      <View style={styles.card}>
        <Text style={styles.icon}>⌂</Text>
        <Text style={styles.cardTitle}>Comparte un lugar especial</Text>
        <Text style={styles.description}>
          Aquí podrás publicar y administrar tus alojamientos cuando estés listo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.light.background, flex: 1, padding: 24, paddingTop: 64 },
  eyebrow: { color: Colors.light.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: Colors.light.text, fontSize: 30, fontWeight: '800', marginBottom: 28, marginTop: 8 },
  card: { alignItems: 'center', backgroundColor: Colors.light.soft, borderRadius: 22, padding: 28 },
  icon: { color: Colors.light.primary, fontSize: 42, marginBottom: 14 },
  cardTitle: { color: Colors.light.primary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  description: { color: '#55716D', fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: 'center' },
});
