import type { DateKey } from '@/models/habit';

const DAY_MS = 86_400_000;
const pad = (value: number) => String(value).padStart(2, '0');

export function localDateKey(date = new Date()): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// UTC is used only for calendar arithmetic, never to assign a completion's day.
function calendarDate(key: DateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('Invalid calendar date');
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  if (date.toISOString().slice(0, 10) !== key) throw new Error('Invalid calendar date');
  return date;
}

export function isDateKey(key: string): boolean {
  try { calendarDate(key); return true; } catch { return false; }
}

export function addDays(key: DateKey, days: number): DateKey {
  return new Date(calendarDate(key).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export function monthStart(key: DateKey): DateKey { return `${key.slice(0, 7)}-01`; }

export function shiftMonth(key: DateKey, offset: number): DateKey {
  const date = calendarDate(monthStart(key));
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}

export function calendarCells(month: DateKey): (DateKey | null)[] {
  const first = monthStart(month);
  const blanks = (calendarDate(first).getUTCDay() + 6) % 7;
  const next = shiftMonth(first, 1);
  const cells: (DateKey | null)[] = Array.from({ length: blanks }, () => null);
  for (let day = first; day < next; day = addDays(day, 1)) cells.push(day);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function formatDate(key: DateKey, options: Intl.DateTimeFormatOptions): string {
  return calendarDate(key).toLocaleDateString(undefined, { ...options, timeZone: 'UTC' });
}

export function millisecondsUntilNextDay(now = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime() + 50;
}

export function canCompleteDate(date: DateKey, created: DateKey, today: DateKey): boolean {
  return isDateKey(date) && date >= created && date <= today;
}

export function calculateStreaks(dates: Iterable<DateKey>, today: DateKey) {
  const sorted = [...new Set(dates)].filter((date) => date <= today).sort();
  const completed = new Set(sorted);
  let current = 0;
  let cursor = completed.has(today) ? today : addDays(today, -1);
  while (completed.has(cursor)) { current++; cursor = addDays(cursor, -1); }
  let longest = 0;
  let run = 0;
  let previous: DateKey | undefined;
  for (const date of sorted) {
    run = previous && addDays(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return { current, longest };
}
