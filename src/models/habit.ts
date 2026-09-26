export type DateKey = string;
export type Appearance = 'system' | 'light' | 'dark';

export interface HabitInput {
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export interface Habit extends HabitInput {
  id: number;
  createdDate: DateKey;
  createdAt: string;
  archived: boolean;
}

export interface HabitCompletion {
  habitId: number;
  date: DateKey;
}

export interface AppSettings {
  appearance: Appearance;
  hapticsEnabled: boolean;
}

export interface HabitData {
  habits: Habit[];
  completions: HabitCompletion[];
  settings: AppSettings;
}

export const DEFAULT_SETTINGS: AppSettings = { appearance: 'system', hapticsEnabled: true };

export class UserInputError extends Error {}
