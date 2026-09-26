import { HABIT_COLORS, HABIT_EMOJIS } from '@/constants/habits';
import type { Database } from '@/data/database';
import { type AppSettings, type Habit, type HabitCompletion, type HabitData, type HabitInput, UserInputError } from '@/models/habit';
import { canCompleteDate, localDateKey } from '@/utils/dates';

type HabitRow = Omit<Habit, 'archived'> & { archived: number };
const HABIT_SELECT = `SELECT id, title, description, emoji, color, created_date AS createdDate,
  created_at AS createdAt, archived FROM habits`;
const decodeHabit = (row: HabitRow): Habit => ({ ...row, archived: row.archived === 1 });

export function validateHabit(input: HabitInput): HabitInput {
  const title = input.title.trim();
  if (!title) throw new UserInputError('Give your habit a title.');
  if (title.length > 80) throw new UserInputError('Keep your title under 80 characters.');
  if (input.description.length > 500) throw new UserInputError('Keep your description under 500 characters.');
  if (!HABIT_EMOJIS.some((emoji) => emoji === input.emoji)) throw new UserInputError('Choose an emoji for your habit.');
  if (!HABIT_COLORS.some((color) => color.value === input.color)) throw new UserInputError('Choose a color for your habit.');
  return { ...input, title, description: input.description.trim() };
}

export function createRepository(db: Database, clock = () => new Date()) {
  async function findHabit(id: number) {
    const row = await db.getFirstAsync<HabitRow>(`${HABIT_SELECT} WHERE id = ?`, id);
    if (!row) throw new UserInputError('This habit could not be found.');
    return decodeHabit(row);
  }

  return {
    async readAll(): Promise<HabitData> {
      const habits = await db.getAllAsync<HabitRow>(`${HABIT_SELECT} ORDER BY id ASC`);
      const completions = await db.getAllAsync<HabitCompletion>('SELECT habit_id AS habitId, date FROM completions ORDER BY date');
      const settings = await db.getFirstAsync<{ appearance: AppSettings['appearance']; hapticsEnabled: number }>(
        'SELECT appearance, haptics_enabled AS hapticsEnabled FROM app_settings WHERE id = 1');
      if (!settings) throw new Error('Settings are missing.');
      return { habits: habits.map(decodeHabit), completions, settings: { ...settings, hapticsEnabled: settings.hapticsEnabled === 1 } };
    },
    async createHabit(input: HabitInput): Promise<Habit> {
      const values = validateHabit(input);
      const now = clock();
      const createdDate = localDateKey(now);
      const createdAt = now.toISOString();
      const result = await db.runAsync(
        'INSERT INTO habits (title, description, emoji, color, created_date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        values.title, values.description, values.emoji, values.color, createdDate, createdAt);
      return { ...values, id: result.lastInsertRowId, createdDate, createdAt, archived: false };
    },
    async updateHabit(id: number, input: HabitInput): Promise<Habit> {
      const values = validateHabit(input);
      const habit = await findHabit(id);
      if (habit.archived) throw new UserInputError('Restore this habit before editing it.');
      await db.runAsync('UPDATE habits SET title = ?, description = ?, emoji = ?, color = ? WHERE id = ?',
        values.title, values.description, values.emoji, values.color, id);
      return { ...habit, ...values };
    },
    async setArchived(id: number, archived: boolean): Promise<Habit> {
      const habit = await findHabit(id);
      await db.runAsync('UPDATE habits SET archived = ? WHERE id = ?', archived ? 1 : 0, id);
      return { ...habit, archived };
    },
    async setCompletion(habitId: number, date: string, completed: boolean) {
      const habit = await findHabit(habitId);
      if (habit.archived) throw new UserInputError('Restore this habit before changing its history.');
      if (!canCompleteDate(date, habit.createdDate, localDateKey(clock()))) {
        throw new UserInputError('Choose a day between the habit’s start date and today.');
      }
      if (completed) {
        await db.runAsync('INSERT OR IGNORE INTO completions (habit_id, date) VALUES (?, ?)', habitId, date);
      } else {
        await db.runAsync('DELETE FROM completions WHERE habit_id = ? AND date = ?', habitId, date);
      }
    },
    async saveSettings(settings: AppSettings): Promise<AppSettings> {
      if (!['system', 'light', 'dark'].includes(settings.appearance) || typeof settings.hapticsEnabled !== 'boolean') {
        throw new UserInputError('Choose a valid preference.');
      }
      await db.runAsync('UPDATE app_settings SET appearance = ?, haptics_enabled = ? WHERE id = 1',
        settings.appearance, settings.hapticsEnabled ? 1 : 0);
      return { ...settings };
    },
  };
}

export type HabitRepository = ReturnType<typeof createRepository>;
