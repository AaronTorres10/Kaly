import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '../../constants/Colors';

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onOpenFilters: () => void;
  activeFilterCount?: number;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onOpenFilters,
  activeFilterCount = 0,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <Text style={styles.icon}>⌕</Text>
        <TextInput
          accessibilityLabel="Destino"
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="¿A dónde vas?"
          placeholderTextColor={Colors.light.muted}
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
        <Pressable
          accessibilityLabel="Buscar alojamientos"
          accessibilityRole="button"
          onPress={onSubmit}
          style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel="Abrir filtros"
        accessibilityRole="button"
        onPress={onOpenFilters}
        style={styles.filterButton}>
        <Text style={styles.filterIcon}>☷</Text>
        <Text style={styles.filterText}>Filtros</Text>
        {activeFilterCount > 0 ? (
          <View accessibilityLabel={`${activeFilterCount} filtros activos`} style={styles.countBadge}>
            <Text style={styles.countText}>{activeFilterCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 22 },
  inputRow: {
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.soft,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    paddingLeft: 14,
    paddingRight: 7,
  },
  icon: { color: Colors.light.accent, fontSize: 28, lineHeight: 30, marginRight: 9 },
  input: { color: Colors.light.text, flex: 1, fontSize: 15, minHeight: 54 },
  searchButton: { backgroundColor: Colors.light.primary, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11 },
  searchButtonText: { color: Colors.light.surface, fontSize: 12, fontWeight: '800' },
  filterButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginTop: 10, minHeight: 36, paddingHorizontal: 4 },
  filterIcon: { color: Colors.light.primary, fontSize: 20, marginRight: 6 },
  filterText: { color: Colors.light.primary, fontSize: 13, fontWeight: '700' },
  countBadge: { alignItems: 'center', backgroundColor: Colors.light.accent, borderRadius: 10, height: 20, justifyContent: 'center', marginLeft: 6, minWidth: 20, paddingHorizontal: 5 },
  countText: { color: Colors.light.surface, fontSize: 11, fontWeight: '800' },
});
