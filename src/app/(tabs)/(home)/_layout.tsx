import Stack from 'expo-router/stack';
import { AppStack } from '@/components/app-stack';

export default function HomeLayout() {
  return <AppStack><Stack.Screen name="index" options={{ title: 'Home' }} /></AppStack>;
}
