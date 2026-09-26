import type { HabitRepository } from '@/data/repository';
import { type AppSettings, type Habit, type HabitData, type HabitInput, UserInputError } from '@/models/habit';

export interface HabitSnapshot extends HabitData { pending: readonly string[] }

// Serialize writes and publish only committed data. Matching pending actions share one promise.
export class HabitStore {
  private snapshot: HabitSnapshot;
  private listeners = new Set<() => void>();
  private pending = new Map<string, { signature: string; promise: Promise<unknown> }>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private repository: HabitRepository, initialData: HabitData) {
    this.snapshot = { ...initialData, pending: [] };
  }

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  whenIdle = () => this.queue;

  private publish(data: Partial<HabitSnapshot>) {
    this.snapshot = { ...this.snapshot, ...data };
    this.listeners.forEach((listener) => listener());
  }

  private write<T>(key: string, signature: string, action: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) {
      if (existing.signature === signature) return existing.promise as Promise<T>;
      return Promise.reject(new UserInputError('A change is still being saved. Please try again in a moment.'));
    }
    const result = this.queue.then(action);
    const settled = result.finally(() => {
      this.pending.delete(key);
      this.publish({ pending: [...this.pending.keys()] });
    });
    this.pending.set(key, { signature, promise: settled });
    this.queue = settled.catch(() => undefined);
    this.publish({ pending: [...this.pending.keys()] });
    return settled;
  }

  private replaceHabit(habit: Habit) {
    this.publish({ habits: this.snapshot.habits.map((item) => item.id === habit.id ? habit : item) });
  }

  createHabit = (input: HabitInput) => this.write('create', JSON.stringify(input), async () => {
    const habit = await this.repository.createHabit(input);
    this.publish({ habits: [...this.snapshot.habits, habit] });
    return habit;
  });

  updateHabit = (id: number, input: HabitInput) => this.write(`habit:${id}`, `edit:${JSON.stringify(input)}`, async () => {
    const habit = await this.repository.updateHabit(id, input);
    this.replaceHabit(habit);
    return habit;
  });

  setArchived = (id: number, archived: boolean) => this.write(`habit:${id}`, `archive:${archived}`, async () => {
    const habit = await this.repository.setArchived(id, archived);
    this.replaceHabit(habit);
    return habit;
  });

  setCompletion = (habitId: number, date: string, completed: boolean) => this.write(`habit:${habitId}`, `complete:${date}:${completed}`, async () => {
    await this.repository.setCompletion(habitId, date, completed);
    const completions = this.snapshot.completions.filter((item) => item.habitId !== habitId || item.date !== date);
    if (completed) completions.push({ habitId, date });
    this.publish({ completions });
  });

  saveSettings = (settings: AppSettings) => this.write('settings', JSON.stringify(settings), async () => {
    const saved = await this.repository.saveSettings(settings);
    this.publish({ settings: saved });
  });
}
