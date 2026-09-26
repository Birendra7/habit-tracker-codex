import Stack from 'expo-router/stack';
import type { ComponentProps } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

export function AppStack({ screenOptions, ...props }: ComponentProps<typeof Stack>) {
  const colors = useTheme();
  const reducedMotion = useReducedMotion();
  return <Stack {...props} screenOptions={{
    headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text }, headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal', contentStyle: { backgroundColor: colors.background },
    animation: reducedMotion ? 'none' : 'default',
    ...(typeof screenOptions === 'object' ? screenOptions : {}),
  }} />;
}
