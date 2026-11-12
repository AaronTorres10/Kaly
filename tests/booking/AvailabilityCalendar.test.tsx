import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => ({
  eq: vi.fn(),
  gte: vi.fn(),
  lt: vi.fn(),
  order: vi.fn(),
  select: vi.fn(),
  then: vi.fn(),
}));

const supabase = vi.hoisted(() => ({ from: vi.fn(() => query) }));

vi.mock('../../lib/supabase', () => ({ supabase }));

describe('AvailabilityCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.eq.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    query.lt.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.select.mockReturnValue(query);
  });

  it('consulta solo el mes solicitado y devuelve los días ordenados', async () => {
    query.then.mockImplementation((resolve) => resolve({
      data: [
        { date: '2027-05-12', is_available: false },
        { date: '2027-05-01', is_available: true },
      ],
      error: null,
    }));

    const { getAvailability } = await import('../../lib/availability/getAvailability');
    await expect(getAvailability('listing-1', '2027-05')).resolves.toEqual([
      { date: '2027-05-12', isAvailable: false },
      { date: '2027-05-01', isAvailable: true },
    ]);
    expect(supabase.from).toHaveBeenCalledWith('listing_availability');
    expect(query.eq).toHaveBeenCalledWith('listing_id', 'listing-1');
    expect(query.gte).toHaveBeenCalledWith('date', '2027-05-01');
    expect(query.lt).toHaveBeenCalledWith('date', '2027-06-01');
    expect(query.order).toHaveBeenCalledWith('date', { ascending: true });
  });

  it('calcula un rango válido aunque la salida esté en el mes siguiente', async () => {
    const { isRangeAvailable } = await import('../../components/booking/availabilityModel');
    const days = [
      { date: '2027-05-31', isAvailable: true },
      { date: '2027-06-01', isAvailable: true },
      { date: '2027-06-02', isAvailable: true },
    ];

    expect(isRangeAvailable(days, '2027-05-31', '2027-06-02')).toBe(true);
    expect(isRangeAvailable([{ date: '2027-05-31', isAvailable: true }, { date: '2027-06-01', isAvailable: false }], '2027-05-31', '2027-06-01')).toBe(false);
    expect(isRangeAvailable(days, '2027-06-02', '2027-05-31')).toBe(false);
  });

  it('abre inicialmente el mes de la primera fecha disponible', async () => {
    const { getInitialAvailabilityMonth } = await import('../../components/booking/availabilityModel');

    expect(getInitialAvailabilityMonth(['2027-05-12', '2027-04-30'], '2026-11')).toBe('2027-04');
    expect(getInitialAvailabilityMonth([], '2026-11')).toBe('2026-11');
  });
});
