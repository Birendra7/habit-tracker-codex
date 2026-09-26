import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type PropsWithChildren } from 'react';
import { Appearance } from 'react-native';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';

export function AppTheme({ children }: PropsWithChildren) {
  const colors = useTheme();
  const { settings } = useHabits();
  const base = colors.isDark ? DarkTheme : DefaultTheme;
  useEffect(() => {
    Appearance.setColorScheme(settings.appearance === 'system' ? 'unspecified' : settings.appearance);
  }, [settings.appearance]);
  return (
    <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.background, text: colors.text, border: colors.border } }}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}
