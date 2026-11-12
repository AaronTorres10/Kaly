import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '../../constants/Colors';
import { getAvailability, type AvailabilityDay } from '../../lib/availability/getAvailability';
import { formatDate, getMonthDays, isRangeAvailable, shiftMonth, toDate } from './availabilityModel';

type AvailabilityCalendarProps = {
  listingId: string;
  capacity?: number;
  pricePerNight?: number;
  initialMonth?: string;
  onChooseDates?: () => void;
  onChange: (value: { checkIn?: string; checkOut?: string }) => void;
  onReserve?: (value: { checkIn: string; checkOut: string; guests: number }) => void;
};

const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const priceFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });

export function AvailabilityCalendar({ listingId, capacity = 1, pricePerNight = 0, initialMonth, onChooseDates, onChange, onReserve }: AvailabilityCalendarProps) {
  const [month, setMonth] = useState(initialMonth ?? formatDate(new Date()).slice(0, 7));
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [selection, setSelection] = useState<{ checkIn?: string; checkOut?: string }>({});
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAvailability(listingId, month);
      setDays((current) => [...current.filter((day) => !day.date.startsWith(month)), ...result]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cargar la disponibilidad.');
    } finally {
      setLoading(false);
    }
  }, [listingId, month]);

  useEffect(() => { void loadMonth(); }, [loadMonth]);

  const availableByDate = useMemo(() => new Map(days.map((day) => [day.date, day.isAvailable])), [days]);
  const monthDays = getMonthDays(month);
  const selectDate = (date: string) => {
    if (availableByDate.get(date) !== true) return;
    const next = !selection.checkIn || selection.checkOut || date <= selection.checkIn
      ? { checkIn: date }
      : isRangeAvailable(days, selection.checkIn, date) ? { checkIn: selection.checkIn, checkOut: date } : selection;
    setSelection(next);
    onChange(next);
  };
  const validRange = Boolean(selection.checkIn && selection.checkOut && isRangeAvailable(days, selection.checkIn, selection.checkOut));
  const monthLabel = monthFormatter.format(toDate(`${month}-01`));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disponibilidad</Text>
      <Text style={styles.subtitle}>Hay fechas disponibles para consultar.</Text>
      <Pressable accessibilityRole="button" onPress={onChooseDates} style={styles.chooseButton}>
        <Text style={styles.chooseButtonText}>Elegir fechas</Text>
      </Pressable>
      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
        <Pressable accessibilityLabel="Mes anterior" accessibilityRole="button" onPress={() => setMonth((current) => shiftMonth(current, -1))} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable accessibilityLabel="Mes siguiente" accessibilityRole="button" onPress={() => setMonth((current) => shiftMonth(current, 1))} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>›</Text>
        </Pressable>
        </View>
        {loading ? <View accessibilityLabel="Cargando disponibilidad" style={styles.state}><ActivityIndicator color={Colors.light.primary} /></View> : error ? (
        <View accessibilityRole="alert" style={styles.state}>
          <Text style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void loadMonth()}><Text style={styles.retry}>Reintentar</Text></Pressable>
        </View>
      ) : (
        <>
          <View style={styles.weekRow}>{WEEKDAYS.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}</View>
          <View style={styles.grid}>
            {monthDays.map((date, index) => date ? (
              <Pressable
                accessibilityLabel={`Fecha ${date}${availableByDate.get(date) === true ? '' : ', no disponible'}`}
                accessibilityRole="button"
                disabled={availableByDate.get(date) !== true}
                key={date}
                onPress={() => selectDate(date)}
                style={[styles.day, selection.checkIn === date || selection.checkOut === date ? styles.selectedDay : undefined, selection.checkIn && selection.checkOut && date > selection.checkIn && date < selection.checkOut ? styles.inRange : undefined]}
              >
                <Text style={[styles.dayText, availableByDate.get(date) !== true ? styles.disabledDayText : undefined, selection.checkIn === date || selection.checkOut === date ? styles.selectedDayText : undefined]}>{toDate(date).getUTCDate()}</Text>
              </Pressable>
            ) : <View key={`empty-${index}`} style={styles.day} />)}
          </View>
        </>
        )}
        <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumen</Text>
        <Text style={styles.summaryText}>{selection.checkIn && selection.checkOut ? `${selection.checkIn} — ${selection.checkOut}` : 'Selecciona entrada y salida'}</Text>
        <View style={styles.guestRow}>
          <Text style={styles.summaryText}>Huéspedes: {guests}</Text>
          <View style={styles.guestControls}>
            <Pressable accessibilityLabel="Quitar huésped" disabled={guests <= 1} onPress={() => setGuests((value) => Math.max(1, value - 1))} style={styles.guestButton}><Text style={styles.guestButtonText}>−</Text></Pressable>
            <Pressable accessibilityLabel="Añadir huésped" disabled={guests >= capacity} onPress={() => setGuests((value) => Math.min(capacity, value + 1))} style={styles.guestButton}><Text style={styles.guestButtonText}>+</Text></Pressable>
          </View>
        </View>
        {pricePerNight > 0 ? <Text style={styles.summaryText}>${priceFormatter.format(pricePerNight)} por noche</Text> : null}
        <Pressable accessibilityRole="button" disabled={!validRange} onPress={() => validRange && onReserve?.({ checkIn: selection.checkIn!, checkOut: selection.checkOut!, guests })} style={[styles.cta, !validRange ? styles.disabledCta : undefined]}>
          <Text style={styles.ctaText}>Continuar con la reserva</Text>
        </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingTop: 12 },
  title: { color: Colors.light.text, fontSize: 15, fontWeight: '800' },
  subtitle: { color: Colors.light.muted, fontSize: 12, marginTop: 7 },
  chooseButton: { alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 10, marginTop: 20, paddingVertical: 13 },
  chooseButtonText: { color: Colors.light.surface, fontSize: 13, fontWeight: '800' },
  calendarCard: { backgroundColor: Colors.light.soft, borderRadius: 14, marginTop: 18, padding: 11 },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  monthLabel: { color: Colors.light.text, fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  monthButton: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  monthButtonText: { color: Colors.light.primary, fontSize: 30 },
  weekRow: { flexDirection: 'row', marginTop: 8 },
  weekday: { color: Colors.light.muted, flex: 1, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', backgroundColor: Colors.light.background, borderRadius: 7, height: 27, justifyContent: 'center', marginBottom: 4, marginHorizontal: '0.7%', width: '12.85%' },
  dayText: { color: Colors.light.text, fontSize: 10 },
  disabledDayText: { color: Colors.light.muted, opacity: 0.55 },
  selectedDay: { backgroundColor: Colors.light.primary, borderRadius: 22 },
  selectedDayText: { color: Colors.light.surface, fontWeight: '800' },
  inRange: { backgroundColor: Colors.light.soft },
  state: { alignItems: 'center', minHeight: 80, justifyContent: 'center' },
  error: { color: Colors.light.primary, textAlign: 'center' },
  retry: { color: Colors.light.accent, fontWeight: '800', marginTop: 8 },
  summary: { borderTopColor: Colors.light.background, borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
  summaryTitle: { color: Colors.light.muted, fontSize: 10 },
  summaryText: { color: Colors.light.text, fontSize: 12, fontWeight: '700', marginTop: 7 },
  guestRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  guestControls: { flexDirection: 'row', gap: 8 },
  guestButton: { alignItems: 'center', backgroundColor: Colors.light.background, borderRadius: 18, height: 27, justifyContent: 'center', width: 27 },
  guestButtonText: { color: Colors.light.primary, fontSize: 20 },
  cta: { alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 8, marginTop: 13, paddingVertical: 11 },
  disabledCta: { backgroundColor: Colors.light.muted, opacity: 0.55 },
  ctaText: { color: Colors.light.surface, fontSize: 11, fontWeight: '800' },
});
