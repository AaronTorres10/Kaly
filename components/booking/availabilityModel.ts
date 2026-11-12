import type { AvailabilityDay } from '../../lib/availability/getAvailability';

export function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getMonthDays(month: string): string[] {
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const last = new Date(Date.UTC(year, monthNumber, 0));
  const days: string[] = [];
  for (let day = 1; day <= last.getUTCDate(); day += 1) {
    days.push(formatDate(new Date(Date.UTC(year, monthNumber - 1, day))));
  }
  return Array.from({ length: first.getUTCDay() }, () => '').concat(days);
}

export function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return formatDate(new Date(Date.UTC(year, monthNumber - 1 + offset, 1))).slice(0, 7);
}

export function getInitialAvailabilityMonth(availableDates: string[], fallbackMonth: string): string {
  const firstDate = [...availableDates].sort()[0];
  return firstDate ? firstDate.slice(0, 7) : fallbackMonth;
}

export function isRangeAvailable(days: AvailabilityDay[], checkIn?: string, checkOut?: string): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return false;
  const available = new Map(days.map((day) => [day.date, day.isAvailable]));
  for (let date = toDate(checkIn); formatDate(date) <= checkOut; date.setUTCDate(date.getUTCDate() + 1)) {
    if (available.get(formatDate(date)) !== true) return false;
  }
  return true;
}
