import { StyleSheet, Text, View } from 'react-native';

export default function ReservationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>TU VIAJE</Text>
      <Text style={styles.title}>Reservas</Text>
      <View style={styles.emptyCard}>
        <Text style={styles.icon}>◷</Text>
        <Text style={styles.cardTitle}>Todavia no tienes reservas</Text>
        <Text style={styles.description}>Tus reservas en Kaly aparecerán aquí para que tengas todo tu viaje a la mano.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFBF8', padding: 24, paddingTop: 64 },
  eyebrow: { color: '#D56D51', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#182322', fontSize: 30, fontWeight: '800', marginTop: 8, marginBottom: 28 },
  emptyCard: { backgroundColor: '#E7F3F1', borderRadius: 22, padding: 28, alignItems: 'center' },
  icon: { color: '#214E4A', fontSize: 42, marginBottom: 14 },
  cardTitle: { color: '#214E4A', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  description: { color: '#55716D', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
});
