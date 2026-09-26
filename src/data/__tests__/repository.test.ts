import { mkdtempSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openTestDatabase } from '../../../tests/sqlite-adapter';
import { DEFAULT_HABIT } from '@/constants/habits';
import { migrateDatabase } from '../database';
import { createRepository } from '../repository';

describe('SQLite persistence', () => {
  let connection: ReturnType<typeof openTestDatabase>;
  let repository: ReturnType<typeof createRepository>;
  const clock = () => new Date(2026, 8, 26, 12);
  const input = { ...DEFAULT_HABIT, title: 'Read a little', description: 'Ten pages' };

  beforeEach(async () => {
    connection = openTestDatabase();
    await migrateDatabase(connection.db);
    repository = createRepository(connection.db, clock);
  });
  afterEach(() => connection.close());

  test('starts empty with persisted defaults and reruns migrations safely', async () => {
    await migrateDatabase(connection.db);
    expect(await repository.readAll()).toEqual({ habits: [], completions: [], settings: { appearance: 'system', hapticsEnabled: true } });
  });
  test('creates and edits all habit fields without resetting history', async () => {
    const habit = await repository.createHabit({ ...input, title: '  Read a little  ' });
    await repository.setCompletion(habit.id, '2026-09-26', true);
    const changed = await repository.updateHabit(habit.id, { ...input, title: 'Read more', emoji: '💧', color: '#477A91' });
    expect(changed).toMatchObject({ title: 'Read more', emoji: '💧', createdDate: '2026-09-26' });
    expect((await repository.readAll()).completions).toEqual([{ habitId: habit.id, date: '2026-09-26' }]);
  });
  test('completions are idempotent and can be undone', async () => {
    const habit = await repository.createHabit(input);
    await repository.setCompletion(habit.id, '2026-09-26', true);
    await repository.setCompletion(habit.id, '2026-09-26', true);
    expect((await repository.readAll()).completions).toHaveLength(1);
    await repository.setCompletion(habit.id, '2026-09-26', false);
    expect((await repository.readAll()).completions).toHaveLength(0);
  });
  test('archive and restore preserve history and original list order', async () => {
    const first = await repository.createHabit(input);
    await repository.createHabit({ ...input, title: 'Walk' });
    await repository.setCompletion(first.id, '2026-09-26', true);
    await repository.setArchived(first.id, true);
    await expect(repository.setCompletion(first.id, '2026-09-26', false)).rejects.toThrow('Restore');
    await expect(repository.updateHabit(first.id, input)).rejects.toThrow('Restore');
    await repository.setArchived(first.id, false);
    const data = await repository.readAll();
    expect(data.habits[0].id).toBe(first.id);
    expect(data.habits[0].archived).toBe(false);
    expect(data.completions).toHaveLength(1);
  });
  test('rejects future days, pre-creation days, empty titles, and missing habits', async () => {
    const habit = await repository.createHabit(input);
    for (const day of ['2026-09-25', '2026-09-27', 'bad']) {
      await expect(repository.setCompletion(habit.id, day, true)).rejects.toThrow('Choose a day');
    }
    await expect(repository.createHabit({ ...input, title: '   ' })).rejects.toThrow('title');
    await expect(repository.setArchived(999, true)).rejects.toThrow('found');
  });
  test('binds quoted titles and enforces foreign keys', async () => {
    const habit = await repository.createHabit({ ...input, title: "Read 'books'; DROP TABLE habits; --" });
    expect((await repository.readAll()).habits[0].title).toBe(habit.title);
    await expect(connection.db.runAsync('INSERT INTO completions VALUES (?, ?)', 999, '2026-09-26')).rejects.toThrow();
  });
  test('does not overwrite a database created by a newer version', async () => {
    await repository.createHabit(input);
    await connection.db.execAsync('PRAGMA user_version = 2');
    await expect(migrateDatabase(connection.db)).rejects.toThrow('newer');
    expect((await repository.readAll()).habits).toHaveLength(1);
  });
  test('habits, progress, and preferences survive closing and reopening a database file', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'habit-tracker-test-'));
    const path = join(directory, 'habits.db');
    let disk = openTestDatabase(path);
    try {
      await migrateDatabase(disk.db);
      const repo = createRepository(disk.db, clock);
      const habit = await repo.createHabit(input);
      await repo.setCompletion(habit.id, '2026-09-26', true);
      await repo.saveSettings({ appearance: 'dark', hapticsEnabled: false });
      disk.close();
      disk = openTestDatabase(path);
      await migrateDatabase(disk.db);
      const data = await createRepository(disk.db, clock).readAll();
      expect(data.habits[0]).toEqual(habit);
      expect(data.completions).toEqual([{ habitId: habit.id, date: '2026-09-26' }]);
      expect(data.settings).toEqual({ appearance: 'dark', hapticsEnabled: false });
    } finally {
      disk.close();
      for (const name of readdirSync(directory)) unlinkSync(join(directory, name));
      rmdirSync(directory);
    }
  });
});
