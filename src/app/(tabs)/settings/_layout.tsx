import Stack from 'expo-router/stack';
import { AppStack } from '@/components/app-stack';

export default function SettingsLayout() {
  return <AppStack>
    <Stack.Screen name="index" options={{ title: 'Settings' }} />
    <Stack.Screen name="archived" options={{ title: 'Archived habits' }} />
  </AppStack>;
}
