import { DEFAULT_HABIT } from '@/constants/habits';
import { DEFAULT_SETTINGS, type HabitData } from '@/models/habit';
import { openTestDatabase } from '../../../tests/sqlite-adapter';
import { migrateDatabase } from '../database';
import { HabitStore } from '../habit-store';
import { createRepository } from '../repository';

describe('write coordination', () => {
  let connection: ReturnType<typeof openTestDatabase>;
  let repository: ReturnType<typeof createRepository>;
  let store: HabitStore;
  const empty: HabitData = { habits: [], completions: [], settings: DEFAULT_SETTINGS };
  const input = { ...DEFAULT_HABIT, title: 'Walk outside' };
  beforeEach(async () => {
    connection = openTestDatabase();
    await migrateDatabase(connection.db);
    repository = createRepository(connection.db, () => new Date(2026, 8, 26, 12));
    store = new HabitStore(repository, empty);
  });
  afterEach(() => connection.close());
  test('rapid identical submissions share a write', async () => {
    const first = store.createHabit(input);
    const second = store.createHabit(input);
    expect(second).toBe(first);
    expect(store.getSnapshot().pending).toContain('create');
    await Promise.all([first, second]);
    expect(store.getSnapshot().habits).toHaveLength(1);
    expect(store.getSnapshot().pending).toEqual([]);
  });
  test('failed writes do not publish a false success and can be retried', async () => {
    const habit = await store.createHabit(input);
    jest.spyOn(repository, 'setCompletion').mockRejectedValueOnce(new Error('disk full'));
    await expect(store.setCompletion(habit.id, '2026-09-26', true)).rejects.toThrow('disk full');
    expect(store.getSnapshot().completions).toEqual([]);
    expect(store.getSnapshot().pending).toEqual([]);
    await store.setCompletion(habit.id, '2026-09-26', true);
    expect(store.getSnapshot().completions).toHaveLength(1);
  });
  test('rejects conflicting pending actions instead of silently dropping changes', async () => {
    const habit = await store.createHabit(input);
    const completion = store.setCompletion(habit.id, '2026-09-26', true);
    await expect(store.setArchived(habit.id, true)).rejects.toThrow('still being saved');
    await completion;
    expect(store.getSnapshot().habits[0].archived).toBe(false);
  });
  test('serializes independent writes without losing either update', async () => {
    const habit = await store.createHabit(input);
    await Promise.all([
      store.setCompletion(habit.id, '2026-09-26', true),
      store.saveSettings({ appearance: 'dark', hapticsEnabled: false }),
    ]);
    expect(store.getSnapshot().completions).toHaveLength(1);
    expect(store.getSnapshot().settings.appearance).toBe('dark');
  });
});
