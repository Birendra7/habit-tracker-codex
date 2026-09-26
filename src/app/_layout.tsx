import Stack from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppStack } from '@/components/app-stack';
import { AppProvider } from '@/providers/app-provider';
import { AppTheme } from '@/providers/app-theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  useEffect(() => { void SplashScreen.hideAsync().catch(() => undefined); }, []);
  return (
    <AppProvider>
      <AppTheme>
        <AppStack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="habit/[id]" options={{ title: 'Habit' }} />
          <Stack.Screen name="habit-form" options={{ presentation: 'modal', title: 'New habit' }} />
        </AppStack>
      </AppTheme>
    </AppProvider>
  );
}
