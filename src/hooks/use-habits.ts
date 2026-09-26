import { createContext, use, useSyncExternalStore } from 'react';
import type { HabitStore } from '@/data/habit-store';

export const HabitStoreContext = createContext<HabitStore | null>(null);

export function useHabits() {
  const store = use(HabitStoreContext);
  if (!store) throw new Error('Habit screens must be inside AppProvider.');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...snapshot, store };
}
