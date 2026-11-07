import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '../../constants/Colors';
import type { SearchInput } from '../../lib/listings/searchListings';

export type SearchFilters = Omit<SearchInput, 'destination'>;

type FiltersSheetProps = {
  visible: boolean;
  initialFilters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClear: () => void;
  onClose: () => void;
};

const AMENITIES = [
  { value: 'wifi', label: 'Wifi' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'terraza', label: 'Terraza' },
  { value: 'chimenea', label: 'Chimenea' },
];

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function FiltersSheet({ visible, initialFilters, onApply, onClear, onClose }: FiltersSheetProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setCheckIn(initialFilters.checkIn ?? '');
    setCheckOut(initialFilters.checkOut ?? '');
    setGuests(initialFilters.guests?.toString() ?? '');
    setMinPrice(initialFilters.minPrice?.toString() ?? '');
    setMaxPrice(initialFilters.maxPrice?.toString() ?? '');
    setAmenities(initialFilters.amenities ?? []);
  }, [initialFilters, visible]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((current) => current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity]);
  };

  const apply = () => {
    onApply({
      checkIn: checkIn.trim() || undefined,
      checkOut: checkOut.trim() || undefined,
      guests: toOptionalNumber(guests),
      minPrice: toOptionalNumber(minPrice),
      maxPrice: toOptionalNumber(maxPrice),
      amenities: amenities.length > 0 ? amenities : undefined,
    });
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtra tu búsqueda</Text>
            <Pressable accessibilityLabel="Cerrar filtros" accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Fechas</Text>
            <View style={styles.row}>
              <TextInput accessibilityLabel="Fecha de entrada" onChangeText={setCheckIn} placeholder="Entrada AAAA-MM-DD" placeholderTextColor={Colors.light.muted} style={[styles.input, styles.halfInput]} value={checkIn} />
              <TextInput accessibilityLabel="Fecha de salida" onChangeText={setCheckOut} placeholder="Salida AAAA-MM-DD" placeholderTextColor={Colors.light.muted} style={[styles.input, styles.halfInput]} value={checkOut} />
            </View>

            <Text style={styles.label}>Huéspedes</Text>
            <TextInput accessibilityLabel="Número de huéspedes" keyboardType="number-pad" onChangeText={setGuests} placeholder="Cualquier cantidad" placeholderTextColor={Colors.light.muted} style={styles.input} value={guests} />

            <Text style={styles.label}>Precio por noche</Text>
            <View style={styles.row}>
              <TextInput accessibilityLabel="Precio mínimo" keyboardType="number-pad" onChangeText={setMinPrice} placeholder="Mínimo" placeholderTextColor={Colors.light.muted} style={[styles.input, styles.halfInput]} value={minPrice} />
              <TextInput accessibilityLabel="Precio máximo" keyboardType="number-pad" onChangeText={setMaxPrice} placeholder="Máximo" placeholderTextColor={Colors.light.muted} style={[styles.input, styles.halfInput]} value={maxPrice} />
            </View>

            <Text style={styles.label}>Servicios</Text>
            <View style={styles.amenities}>
              {AMENITIES.map((amenity) => {
                const selected = amenities.includes(amenity.value);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    key={amenity.value}
                    onPress={() => toggleAmenity(amenity.value)}
                    style={[styles.amenity, selected ? styles.amenitySelected : null]}>
                    <Text style={[styles.amenityText, selected ? styles.amenityTextSelected : null]}>{amenity.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable accessibilityRole="button" onPress={apply} style={styles.applyButton}>
              <Text style={styles.applyText}>Aplicar filtros</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClear} style={styles.clearButton}>
              <Text style={styles.clearText}>Limpiar filtros</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(24, 35, 34, 0.35)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.light.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '88%' },
  header: { alignItems: 'center', borderBottomColor: Colors.light.soft, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 22 },
  title: { color: Colors.light.text, fontSize: 21, fontWeight: '800' },
  closeButton: { padding: 6 },
  closeText: { color: Colors.light.primary, fontSize: 13, fontWeight: '700' },
  content: { padding: 22, paddingBottom: 40 },
  label: { color: Colors.light.text, fontSize: 14, fontWeight: '800', marginBottom: 8, marginTop: 18 },
  row: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: Colors.light.surface, borderColor: Colors.light.soft, borderRadius: 12, borderWidth: 1, color: Colors.light.text, fontSize: 14, minHeight: 48, paddingHorizontal: 13 },
  halfInput: { flex: 1 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  amenity: { backgroundColor: Colors.light.surface, borderColor: Colors.light.soft, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10 },
  amenitySelected: { backgroundColor: Colors.light.soft, borderColor: Colors.light.primary },
  amenityText: { color: Colors.light.primary, fontSize: 13, fontWeight: '700' },
  amenityTextSelected: { color: Colors.light.primary },
  applyButton: { alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 14, marginTop: 28, paddingVertical: 15 },
  applyText: { color: Colors.light.surface, fontSize: 15, fontWeight: '800' },
  clearButton: { alignItems: 'center', paddingVertical: 16 },
  clearText: { color: Colors.light.accent, fontSize: 14, fontWeight: '800' },
});
