import { addDays, calculateStreaks, calendarCells, canCompleteDate, formatDate, isDateKey, localDateKey, millisecondsUntilNextDay, shiftMonth } from '../dates';

describe('calendar dates', () => {
  test('assigns the local day, including times close to midnight', () => {
    expect(localDateKey(new Date(2026, 8, 26, 0, 1))).toBe('2026-09-26');
    expect(localDateKey(new Date(2026, 8, 26, 23, 59))).toBe('2026-09-26');
  });
  test.each([
    ['2024-02-28', 1, '2024-02-29'], ['2024-02-29', 1, '2024-03-01'],
    ['2025-02-28', 1, '2025-03-01'], ['2025-12-31', 1, '2026-01-01'],
    ['2026-01-01', -1, '2025-12-31'], ['2026-03-08', 1, '2026-03-09'],
    ['2026-11-01', 1, '2026-11-02'],
  ])('adds calendar days across boundaries: %s', (day, count, expected) => {
    expect(addDays(day, count)).toBe(expected);
  });
  test('rejects malformed and impossible dates', () => {
    for (const key of ['2025-02-29', '2026-13-01', '2026-02-30', '2026-2-01', 'bad']) expect(isDateKey(key)).toBe(false);
  });
  test('generates a Monday-first calendar without neighboring dates', () => {
    const cells = calendarCells('2026-09-26');
    expect(cells.slice(0, 3)).toEqual([null, '2026-09-01', '2026-09-02']);
    expect(cells.filter(Boolean)).toHaveLength(30);
    expect(cells.length % 7).toBe(0);
    expect(calendarCells('2024-02-01')).toContain('2024-02-29');
    expect(shiftMonth('2026-01-31', -1)).toBe('2025-12-01');
  });
  test('permits only days from creation through today', () => {
    expect(canCompleteDate('2026-09-25', '2026-09-25', '2026-09-26')).toBe(true);
    expect(canCompleteDate('2026-09-26', '2026-09-25', '2026-09-26')).toBe(true);
    expect(canCompleteDate('2026-09-24', '2026-09-25', '2026-09-26')).toBe(false);
    expect(canCompleteDate('2026-09-27', '2026-09-25', '2026-09-26')).toBe(false);
  });
  test('schedules the next local midnight instead of a fixed 24 hours', () => {
    for (const [now, expected] of [[new Date(2026, 2, 8), '2026-03-09'], [new Date(2026, 10, 1), '2026-11-02']] as const) {
      const next = new Date(now.getTime() + millisecondsUntilNextDay(now));
      expect(localDateKey(next)).toBe(expected);
      expect(next.getHours()).toBe(0);
    }
    expect(millisecondsUntilNextDay(new Date(2026, 8, 26, 23, 59, 59))).toBe(1050);
  });
  test('formats calendar dates without local timezone shifts', () => {
    expect(formatDate('2026-09-01', { day: 'numeric' })).toBe('1');
  });
});

describe('streaks', () => {
  test.each([
    [[], 0, 0],
    [['2026-09-26'], 1, 1],
    [['2026-09-24', '2026-09-25'], 2, 2],
    [['2026-09-24'], 0, 1],
    [['2026-09-22', '2026-09-23', '2026-09-25', '2026-09-26'], 2, 2],
    [['2026-09-26', '2026-09-25', '2026-09-25', '2026-09-27'], 2, 2],
  ])('handles gaps, duplicates, and future dates: %j', (dates, current, longest) => {
    expect(calculateStreaks(dates as string[], '2026-09-26')).toEqual({ current, longest });
  });
  test('recalculates after adding and removing a past completion', () => {
    const dates = ['2026-09-23', '2026-09-25', '2026-09-26'];
    expect(calculateStreaks(dates, '2026-09-26').current).toBe(2);
    expect(calculateStreaks([...dates, '2026-09-24'], '2026-09-26').current).toBe(4);
    expect(calculateStreaks(dates.slice(0, -1), '2026-09-26').current).toBe(1);
  });
  test('does not bridge an archived gap', () => {
    expect(calculateStreaks(['2026-09-20', '2026-09-21', '2026-09-26'], '2026-09-26')).toEqual({ current: 1, longest: 2 });
  });
});
