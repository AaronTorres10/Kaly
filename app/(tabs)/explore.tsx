import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const filters = ['Todos', 'Meditación', 'Movimiento', 'Sueño'];
const items = [
  { title: 'Respira y suelta', meta: 'Meditación · 12 min', icon: '🌿', color: '#DCEBDD' },
  { title: 'Estirar al despertar', meta: 'Movimiento · 15 min', icon: '☀️', color: '#FAEAC6' },
  { title: 'Noche tranquila', meta: 'Sueño · 20 min', icon: '🌙', color: '#E4DFF2' },
];

export default function ExploreScreen() {
  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.kicker}>DESCUBRE</Text><Text style={styles.title}>Encuentra tu{`\n`}próximo momento.</Text>
    <View style={styles.search}><Ionicons name="search-outline" size={20} color="#173C38" /><TextInput placeholder="Buscar prácticas, temas..." placeholderTextColor="#87938C" style={styles.input} /><Ionicons name="options-outline" size={20} color="#173C38" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((filter, i) => <TouchableOpacity key={filter} style={[styles.filter, i === 0 && styles.filterActive]}><Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{filter}</Text></TouchableOpacity>)}</ScrollView>
    <View style={styles.heading}><Text style={styles.sectionTitle}>Recomendado para ti</Text><Text style={styles.count}>24 prácticas</Text></View>
    {items.map((item) => <TouchableOpacity style={styles.item} key={item.title}><View style={[styles.itemArt, { backgroundColor: item.color }]}><Text style={styles.emoji}>{item.icon}</Text></View><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemMeta}>{item.meta}</Text><View style={styles.start}><Text style={styles.startText}>Empezar</Text><Ionicons name="arrow-forward" size={14} color="#286057" /></View></View><Ionicons name="bookmark-outline" size={21} color="#63877D" /></TouchableOpacity>)}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FFFDF9' }, content: { padding: 22, paddingBottom: 30 }, kicker: { color: '#8B968F', fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 8 }, title: { color: '#173C38', fontSize: 31, lineHeight: 36, fontWeight: '700', marginBottom: 22 }, search: { height: 53, borderRadius: 16, backgroundColor: '#F2F5EF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 }, input: { flex: 1, fontSize: 14, color: '#173C38' }, filters: { gap: 9, paddingVertical: 25 }, filter: { paddingHorizontal: 17, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E0E7DF' }, filterActive: { backgroundColor: '#173C38', borderColor: '#173C38' }, filterText: { color: '#63776E', fontSize: 12, fontWeight: '600' }, filterTextActive: { color: '#FFFDF9' }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, sectionTitle: { color: '#173C38', fontSize: 19, fontWeight: '700' }, count: { color: '#8B968F', fontSize: 12 }, item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7F2', borderRadius: 19, padding: 11, marginBottom: 12, gap: 13 }, itemArt: { width: 78, height: 82, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, emoji: { fontSize: 31 }, itemCopy: { flex: 1 }, itemTitle: { color: '#173C38', fontWeight: '700', fontSize: 15, marginBottom: 5 }, itemMeta: { color: '#829088', fontSize: 11 }, start: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 11 }, startText: { color: '#286057', fontSize: 12, fontWeight: '700' }, });
