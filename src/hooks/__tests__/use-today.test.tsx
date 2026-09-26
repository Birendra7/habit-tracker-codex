import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useToday } from '../use-today';

beforeEach(() => jest.useFakeTimers());
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('updates at local midnight', async () => {
  jest.setSystemTime(new Date(2026, 8, 26, 23, 59, 59));
  const { result, unmount } = await renderHook(useToday);
  expect(result.current).toBe('2026-09-26');
  await act(async () => { jest.advanceTimersByTime(1100); });
  expect(result.current).toBe('2026-09-27');
  await unmount();
});

test('refreshes the day immediately on resume after a clock change', async () => {
  jest.setSystemTime(new Date(2026, 8, 26, 12));
  let onChange: ((state: AppStateStatus) => void) | undefined;
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    onChange = listener;
    return { remove };
  });
  const { result, unmount } = await renderHook(useToday);
  await act(async () => {
    jest.setSystemTime(new Date(2026, 8, 28, 9));
    onChange?.('active');
  });
  expect(result.current).toBe('2026-09-28');
  await unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});
