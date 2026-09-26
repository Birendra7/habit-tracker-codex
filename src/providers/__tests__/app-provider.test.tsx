import { fireEvent, render, screen } from '@testing-library/react-native';
import { openDatabaseAsync } from 'expo-sqlite';
import { Text } from 'react-native';
import { migrateDatabase } from '@/data/database';
import { AppProvider } from '../app-provider';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('@/data/database', () => ({ migrateDatabase: jest.fn(async () => undefined) }));
jest.mock('@/data/repository', () => ({ createRepository: () => ({ readAll: async () => ({ habits: [], completions: [], settings: { appearance: 'system', hapticsEnabled: true } }) }) }));

test('a failed database open shows retry and never exposes editable screens', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const closeAsync = jest.fn(async () => undefined);
  jest.mocked(openDatabaseAsync).mockRejectedValueOnce(new Error('temporary failure')).mockResolvedValueOnce({ closeAsync } as never);
  try {
    const { unmount } = await render(<AppProvider><Text>Editable app</Text></AppProvider>);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Your data has not been reset/);
    expect(screen.queryByText('Editable app')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Editable app')).toBeOnTheScreen();
    expect(openDatabaseAsync).toHaveBeenCalledTimes(2);
    expect(migrateDatabase).toHaveBeenCalledTimes(1);
    await unmount();
    expect(closeAsync).toHaveBeenCalledTimes(1);
  } finally { log.mockRestore(); }
});
