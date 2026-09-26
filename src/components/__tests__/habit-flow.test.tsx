import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Alert } from 'react-native';
import HomeScreen from '@/app/(tabs)/(home)';
import SettingsScreen from '@/app/(tabs)/settings';
import HabitDetailScreen from '@/app/habit/[id]';
import { HabitCalendar } from '@/components/habit-calendar';
import { HabitEditor } from '@/components/habit-editor';
import { DEFAULT_HABIT } from '@/constants/habits';
import { HabitStore } from '@/data/habit-store';
import type { HabitRepository } from '@/data/repository';
import { HabitStoreContext } from '@/hooks/use-habits';
import { DEFAULT_SETTINGS, type Habit, type HabitData } from '@/models/habit';
import { formatDate } from '@/utils/dates';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: '1' }),
  Link: ({ children }: { children: ReactElement }) => children,
}));
jest.mock('expo-router/stack', () => ({ __esModule: true, default: Object.assign(() => null, { Screen: () => null }) }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('react-native-reanimated', () => {
  const { Text } = jest.requireActual('react-native');
  const animation = { duration: () => animation, reduceMotion: () => animation };
  return { __esModule: true, default: { Text }, FadeIn: animation, ReduceMotion: { System: 'system' } };
});
jest.mock('@/utils/haptics', () => ({ completionFeedback: jest.fn() }));
jest.mock('@/hooks/use-today', () => ({ useToday: () => '2026-09-26' }));

const habit: Habit = { ...DEFAULT_HABIT, id: 1, title: 'Read a little', description: 'Ten pages', createdDate: '2026-09-24', createdAt: '2026-09-24T12:00:00.000Z', archived: false };
const dateLabel = (date: string) => formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

async function renderApp(element: ReactElement, data: Partial<HabitData> = {}) {
  const initial = { habits: [habit], completions: [], settings: DEFAULT_SETTINGS, ...data };
  const repository: HabitRepository = {
    readAll: jest.fn(async () => initial),
    createHabit: jest.fn(async (input) => ({ ...habit, ...input })),
    updateHabit: jest.fn(async (id, input) => ({ ...habit, ...input, id })),
    setArchived: jest.fn(async (id, archived) => ({ ...habit, id, archived })),
    setCompletion: jest.fn(async () => undefined),
    saveSettings: jest.fn(async (settings) => settings),
  };
  const store = new HabitStore(repository, initial);
  await render(<HabitStoreContext value={store}>{element}</HabitStoreContext>);
  return { store, repository };
}

test('home has an empty state and does not create sample habits', async () => {
  const { store } = await renderApp(<HomeScreen />, { habits: [] });
  expect(screen.getByRole('button', { name: 'Create your first habit' })).toBeOnTheScreen();
  expect(store.getSnapshot().habits).toEqual([]);
});

test('home checks and unchecks today with accessible state and an updated count', async () => {
  await renderApp(<HomeScreen />);
  const checkbox = () => screen.getByRole('checkbox', { name: 'Complete Read a little for today' });
  expect(checkbox()).not.toBeChecked();
  await fireEvent.press(checkbox());
  expect(checkbox()).toBeChecked();
  expect(screen.getByText('1 / 1')).toBeOnTheScreen();
  await fireEvent.press(checkbox());
  expect(checkbox()).not.toBeChecked();
  expect(screen.getByText('0 / 1')).toBeOnTheScreen();
});

test('archived habits are excluded from Home and its totals', async () => {
  await renderApp(<HomeScreen />, { habits: [habit, { ...habit, id: 2, title: 'Archived walk', archived: true }] });
  expect(screen.queryByText('Archived walk')).toBeNull();
  expect(screen.getByText('0 / 1')).toBeOnTheScreen();
});

test('the editor saves all four fields and prevents empty titles', async () => {
  const save = jest.fn(async () => undefined);
  await renderApp(<HabitEditor pending={false} onSave={save} onCancel={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'Create habit' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Habit title'), 'Drink water');
  await fireEvent.changeText(screen.getByLabelText('Habit description'), 'A glass after waking');
  await fireEvent.press(screen.getByRole('button', { name: 'Choose 💧' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Ocean color' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Create habit' }));
  expect(save).toHaveBeenCalledWith({ title: 'Drink water', description: 'A glass after waking', emoji: '💧', color: '#477A91' });
});

test('failed saves retain the form and allow retry', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const save = jest.fn().mockRejectedValueOnce(new Error('disk full')).mockResolvedValueOnce(undefined);
  try {
    await renderApp(<HabitEditor habit={habit} pending={false} onSave={save} onCancel={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText('Habit title'), 'Read more');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be saved/);
    expect(screen.getByLabelText('Habit title')).toHaveDisplayValue('Read more');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(save).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  } finally { log.mockRestore(); }
});

test('calendar protects future and pre-creation days and allows corrections', async () => {
  const toggle = jest.fn();
  await renderApp(<HabitCalendar today="2026-09-26" createdDate="2026-09-24" completed={new Set(['2026-09-25'])}
    color={habit.color} busy={false} readOnly={false} onToggle={toggle} />);
  expect(screen.getByRole('checkbox', { name: dateLabel('2026-09-23') })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: dateLabel('2026-09-27') })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: dateLabel('2026-09-25') })).toBeChecked();
  await fireEvent.press(screen.getByRole('checkbox', { name: dateLabel('2026-09-25') }));
  expect(toggle).toHaveBeenCalledWith('2026-09-25');
  expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
});

test('archived history is read-only until restoring the habit', async () => {
  const { store } = await renderApp(<HabitDetailScreen />, { habits: [{ ...habit, archived: true }] });
  expect(screen.getByRole('checkbox', { name: dateLabel('2026-09-26') })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Restore habit' }));
  expect(store.getSnapshot().habits[0].archived).toBe(false);
  expect(screen.getByRole('checkbox', { name: dateLabel('2026-09-26') })).not.toBeDisabled();
});

test('archiving preserves history after confirmation', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  try {
    const { store } = await renderApp(<HabitDetailScreen />, { completions: [{ habitId: 1, date: '2026-09-25' }] });
    await fireEvent.press(screen.getByRole('button', { name: 'Archive habit' }));
    const confirm = alert.mock.calls[0][2]?.find((button) => button.text === 'Archive');
    await act(async () => { confirm?.onPress?.(); await store.whenIdle(); });
    expect(store.getSnapshot().habits[0].archived).toBe(true);
    expect(store.getSnapshot().completions).toHaveLength(1);
  } finally { alert.mockRestore(); }
});

test('settings update appearance and haptics in shared state', async () => {
  const { store } = await renderApp(<SettingsScreen />);
  await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }));
  expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
  await fireEvent(screen.getByRole('switch', { name: 'Completion haptics' }), 'valueChange', false);
  expect(store.getSnapshot().settings).toEqual({ appearance: 'dark', hapticsEnabled: false });
});
