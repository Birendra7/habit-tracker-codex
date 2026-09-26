import { useColorScheme } from 'react-native';
import { palettes } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';

export function useTheme() {
  const system = useColorScheme();
  const { settings } = useHabits();
  const isDark = (settings.appearance === 'system' ? system : settings.appearance) === 'dark';
  return { ...palettes[isDark ? 'dark' : 'light'], isDark };
}
