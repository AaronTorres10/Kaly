import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const stays = [
  { title: 'Casa del Lago', location: 'Valle de Bravo, Mexico', price: '$1,850', color: '#B8D8D8', tag: 'Escapada' },
  { title: 'Loft del Centro', location: 'Oaxaca, Mexico', price: '$1,240', color: '#F3C6A8', tag: 'Popular' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BUENOS DIAS</Text>
            <Text style={styles.title}>Encuentra tu proximo lugar</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>JD</Text></View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <View><Text style={styles.searchLabel}>A donde vas?</Text><Text style={styles.searchValue}>Explora destinos unicos</Text></View>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Categorias</Text><Text style={styles.link}>Ver todas</Text></View>
        <View style={styles.categories}>
          {['Playa', 'Montana', 'Ciudad', 'Descanso'].map((category, index) => (
            <Pressable key={category} style={[styles.category, { backgroundColor: ['#E7F3F1', '#FFF0E5', '#F0ECFA', '#FFF6D8'][index] }]}>
              <Text style={styles.categoryIcon}>{['~', '^', '+', 'o'][index]}</Text><Text style={styles.categoryText}>{category}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recomendados para ti</Text><Text style={styles.link}>Ver mas</Text></View>
        {stays.map((stay) => <Pressable key={stay.title} style={styles.card}>
          <View style={[styles.cardImage, { backgroundColor: stay.color }]}><Text style={styles.cardTag}>{stay.tag}</Text><Text style={styles.cardImageText}>K</Text></View>
          <View style={styles.cardInfo}><View style={styles.cardTitleRow}><Text style={styles.cardTitle}>{stay.title}</Text><Text style={styles.heart}>♡</Text></View><Text style={styles.location}>{stay.location}</Text><Text style={styles.price}>{stay.price} <Text style={styles.night}>/ noche</Text></Text></View>
        </Pressable>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFBF8' },
  container: {
    flex: 1,
    padding: 22,
    paddingBottom: 32,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  eyebrow: { color: '#8C9290', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7 },
  title: { color: '#182322', fontSize: 28, fontWeight: '800', lineHeight: 34, maxWidth: 270 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#214E4A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700' },
  searchBox: { backgroundColor: '#FFF', borderRadius: 18, padding: 17, flexDirection: 'row', alignItems: 'center', shadowColor: '#214E4A', shadowOpacity: 0.08, shadowRadius: 18, elevation: 3, marginBottom: 28 },
  searchIcon: { color: '#E07A5F', fontSize: 31, marginRight: 13, lineHeight: 31 },
  searchLabel: { color: '#1C2927', fontSize: 15, fontWeight: '700' },
  searchValue: { color: '#929A96', fontSize: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#1B2927', fontSize: 18, fontWeight: '800' },
  link: { color: '#D56D51', fontSize: 12, fontWeight: '700' },
  categories: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  category: { width: '23%', minHeight: 78, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  categoryIcon: { color: '#214E4A', fontSize: 25, fontWeight: '700', marginBottom: 6 },
  categoryText: { color: '#38514D', fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 19, padding: 10, marginBottom: 14, shadowColor: '#18332F', shadowOpacity: 0.07, shadowRadius: 14, elevation: 2 },
  cardImage: { height: 145, borderRadius: 14, justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  cardTag: { alignSelf: 'flex-start', color: '#214E4A', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '700' },
  cardImageText: { color: 'rgba(255,255,255,0.8)', fontSize: 58, fontWeight: '900' },
  cardInfo: { padding: 8, paddingBottom: 3 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#1B2927', fontSize: 16, fontWeight: '800' },
  heart: { color: '#D56D51', fontSize: 26 },
  location: { color: '#8C9692', fontSize: 12, marginTop: 5 },
  price: { color: '#D56D51', fontSize: 15, fontWeight: '800', marginTop: 9 },
  night: { color: '#89928F', fontSize: 12, fontWeight: '400' },
});
