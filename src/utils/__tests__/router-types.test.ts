import { resolve } from 'node:path';

// Guards the pinned Expo SDK 57 Windows path patch in patches/.
describe('Expo route types on Windows', () => {
  const previousRoot = process.env.EXPO_ROUTER_APP_ROOT;
  const appRoot = resolve(process.cwd(), 'src/app');
  beforeAll(() => { process.env.EXPO_ROUTER_APP_ROOT = appRoot; });
  afterAll(() => {
    if (previousRoot === undefined) delete process.env.EXPO_ROUTER_APP_ROOT;
    else process.env.EXPO_ROUTER_APP_ROOT = previousRoot;
  });

  test('watcher excludes components and keeps route context keys in POSIX form', async () => {
    const { requireContext } = jest.requireActual('expo-router/internal/testing');
    const { getWatchHandler } = jest.requireActual('@expo/router-server/build/typed-routes');
    const context = requireContext(appRoot);
    const regenerate = jest.fn();
    const handler = getWatchHandler('.expo/types', { ctx: context, regenerateFn: regenerate });
    await handler(resolve(appRoot, '../components/habit-row.tsx'), 'add');
    expect(regenerate).not.toHaveBeenCalled();
    await handler(resolve(appRoot, '(tabs)/(home)/index.tsx'), 'add');
    expect(regenerate).toHaveBeenCalledTimes(1);
    expect(context.keys().some((key: string) => key.includes('\\') || key.includes('../'))).toBe(false);
  });
});
