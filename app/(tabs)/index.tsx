import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = [
  { icon: 'sparkles-outline' as const, label: 'Bienestar', color: '#FCE8D9' },
  { icon: 'leaf-outline' as const, label: 'Naturaleza', color: '#DDEBDD' },
  { icon: 'color-palette-outline' as const, label: 'Creatividad', color: '#E7E1F5' },
  { icon: 'people-outline' as const, label: 'Comunidad', color: '#F8E7B9' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BUENOS DÍAS, LUCÍA</Text>
            <Text style={styles.title}>Tu momento{`\n`}empieza aquí.</Text>
          </View>
          <TouchableOpacity style={styles.bell} accessibilityLabel="Notificaciones">
            <Ionicons name="notifications-outline" size={22} color="#173C38" />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.search} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={20} color="#173C38" />
          <Text style={styles.searchText}>¿Qué te apetece descubrir?</Text>
          <Ionicons name="options-outline" size={20} color="#87938C" />
        </TouchableOpacity>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Explora por intención</Text>
          <Text style={styles.seeAll}>Ver todo</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity key={category.label} style={styles.category}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={25} color="#173C38" />
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Para ti esta semana</Text>
          <Ionicons name="arrow-forward" size={18} color="#173C38" />
        </View>
        <TouchableOpacity style={styles.featureCard} activeOpacity={0.9}>
          <View style={styles.featureArt}>
            <Text style={styles.artSun}>☼</Text>
            <View style={styles.artHill} />
            <View style={styles.artHillBack} />
            <Text style={styles.artLeaf}>✦</Text>
          </View>
          <View style={styles.featureInfo}>
            <View style={styles.pill}><Text style={styles.pillText}>NUEVO</Text></View>
            <Text style={styles.featureTitle}>Ritual de calma</Text>
            <Text style={styles.featureDescription}>10 minutos para volver a ti, estés donde estés.</Text>
            <View style={styles.cardFooter}><Text style={styles.duration}>◷  10 min</Text><Ionicons name="arrow-forward-circle" size={27} color="#F2B84B" /></View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, styles.moreTitle]}>Pequeños pasos, gran cambio</Text>
        <View style={styles.miniRow}>
          <View style={[styles.miniCard, { backgroundColor: '#E8F0E8' }]}><Ionicons name="water-outline" size={25} color="#286057" /><Text style={styles.miniTitle}>Pausa consciente</Text><Text style={styles.miniMeta}>5 min · Audio</Text></View>
          <View style={[styles.miniCard, { backgroundColor: '#F9ECD3' }]}><Ionicons name="sunny-outline" size={25} color="#9B6E20" /><Text style={styles.miniTitle}>Empieza suave</Text><Text style={styles.miniMeta}>8 min · Práctica</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF9' }, content: { padding: 22, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  eyebrow: { color: '#8B968F', fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 8 },
  title: { color: '#173C38', fontSize: 32, lineHeight: 37, fontWeight: '700', letterSpacing: -0.6 },
  bell: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, borderColor: '#E2E8E1', alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 9, top: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: '#F2B84B' },
  search: { height: 55, borderRadius: 17, backgroundColor: '#F2F5EF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 11, marginBottom: 30 },
  searchText: { flex: 1, color: '#87938C', fontSize: 14 }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#173C38', fontSize: 19, fontWeight: '700', letterSpacing: -0.2 }, seeAll: { color: '#63877D', fontSize: 13, fontWeight: '600' },
  categories: { gap: 15, paddingBottom: 30 }, category: { alignItems: 'center', width: 76 }, categoryIcon: { width: 63, height: 63, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }, categoryLabel: { color: '#52665E', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  featureCard: { borderRadius: 24, backgroundColor: '#173C38', overflow: 'hidden', marginBottom: 28 }, featureArt: { height: 145, backgroundColor: '#BBD5C2', position: 'relative', overflow: 'hidden' }, artSun: { position: 'absolute', top: 20, right: 34, color: '#F8C867', fontSize: 52, fontWeight: '200' }, artHill: { position: 'absolute', bottom: -38, left: -30, width: 250, height: 130, borderRadius: 100, backgroundColor: '#5D9080', transform: [{ rotate: '-12deg' }] }, artHillBack: { position: 'absolute', bottom: -53, right: -45, width: 280, height: 140, borderRadius: 100, backgroundColor: '#8AB59B', transform: [{ rotate: '10deg' }] }, artLeaf: { position: 'absolute', top: 22, left: 30, color: '#F7F3E9', fontSize: 31 },
  featureInfo: { padding: 18 }, pill: { alignSelf: 'flex-start', backgroundColor: '#E4F0DF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10 }, pillText: { color: '#3B685A', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, featureTitle: { color: '#FFFDF9', fontSize: 22, fontWeight: '700', marginBottom: 5 }, featureDescription: { color: '#C6D8CD', fontSize: 13, lineHeight: 19, maxWidth: 260 }, cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }, duration: { color: '#B5C9BD', fontSize: 12, fontWeight: '600' }, moreTitle: { marginBottom: 15 }, miniRow: { flexDirection: 'row', gap: 12 }, miniCard: { flex: 1, borderRadius: 18, padding: 16, minHeight: 125 }, miniTitle: { color: '#23483F', fontWeight: '700', fontSize: 14, marginTop: 15, marginBottom: 4 }, miniMeta: { color: '#71877D', fontSize: 11 },
});
