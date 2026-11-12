import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import Colors from '../../constants/Colors';
import { type ListingFormErrors, type ListingFormInput, validateListingForm } from '../../lib/host/saveListing';

export { validateListingForm } from '../../lib/host/saveListing';
export type { ListingFormInput } from '../../lib/host/saveListing';

export function parseAmenitiesText(value: string): string[] {
  return value.split(',');
}

type ListingFormProps = {
  initialValues?: Partial<ListingFormInput>;
  onSubmit: (input: ListingFormInput) => Promise<void>;
  submitLabel?: string;
};

const emptyValues: ListingFormInput = {
  title: '', description: '', location: '', pricePerNight: '', capacity: '', amenities: [], isPublished: false,
};

export function ListingForm({ initialValues, onSubmit, submitLabel = 'Guardar publicación' }: ListingFormProps) {
  const [values, setValues] = useState<ListingFormInput>({ ...emptyValues, ...initialValues });
  const [amenitiesText, setAmenitiesText] = useState((initialValues?.amenities ?? []).join(', '));
  const [errors, setErrors] = useState<ListingFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ListingFormInput>(key: K, value: ListingFormInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async () => {
    const nextErrors = validateListingForm(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    try {
      await onSubmit({ ...values, amenities: parseAmenitiesText(amenitiesText) });
    } catch {
      setFormError('No hemos podido guardar la publicación. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Título</Text>
      <TextInput value={values.title} onChangeText={(value) => update('title', value)} placeholder="Ej. Casa del bosque" style={styles.input} />
      {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
      <Text style={styles.label}>Descripción</Text>
      <TextInput value={values.description} onChangeText={(value) => update('description', value)} multiline placeholder="Cuéntales sobre el alojamiento" style={[styles.input, styles.multiline]} />
      <Text style={styles.label}>Ubicación</Text>
      <TextInput value={values.location} onChangeText={(value) => update('location', value)} placeholder="Ciudad o zona" style={styles.input} />
      {errors.location ? <Text style={styles.error}>{errors.location}</Text> : null}
      <View style={styles.row}>
        <View style={styles.half}><Text style={styles.label}>Precio por noche</Text><TextInput value={values.pricePerNight} onChangeText={(value) => update('pricePerNight', value)} keyboardType="numeric" placeholder="1200" style={styles.input} />{errors.pricePerNight ? <Text style={styles.error}>{errors.pricePerNight}</Text> : null}</View>
        <View style={styles.half}><Text style={styles.label}>Capacidad</Text><TextInput value={values.capacity} onChangeText={(value) => update('capacity', value)} keyboardType="numeric" placeholder="4" style={styles.input} />{errors.capacity ? <Text style={styles.error}>{errors.capacity}</Text> : null}</View>
      </View>
      <Text style={styles.label}>Servicios</Text>
      <TextInput value={amenitiesText} onChangeText={setAmenitiesText} placeholder="Wi-Fi, Cocina, Estacionamiento" style={styles.input} />
      <View style={styles.publishRow}><View><Text style={styles.label}>Publicar ahora</Text><Text style={styles.help}>Puedes dejarla como borrador.</Text></View><Switch value={values.isPublished} onValueChange={(value) => update('isPublished', value)} /></View>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={submitLabel} disabled={saving} onPress={() => void submit()} style={[styles.button, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? 'Guardando…' : submitLabel}</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.light.background, flexGrow: 1, padding: 24, paddingTop: 36 },
  label: { color: Colors.light.primary, fontSize: 14, fontWeight: '800', marginBottom: 7, marginTop: 16 },
  input: { backgroundColor: Colors.light.surface, borderColor: '#D5E1DD', borderRadius: 12, borderWidth: 1, color: Colors.light.text, minHeight: 48, paddingHorizontal: 14 },
  multiline: { minHeight: 96, paddingTop: 14, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  error: { color: '#B54735', fontSize: 12, marginTop: 5 },
  formError: { color: '#B54735', marginTop: 18, textAlign: 'center' },
  publishRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  help: { color: Colors.light.muted, fontSize: 12 },
  button: { alignItems: 'center', backgroundColor: Colors.light.accent, borderRadius: 13, marginTop: 28, padding: 16 },
  disabled: { opacity: 0.6 },
  buttonText: { color: Colors.light.surface, fontWeight: '800' },
});
