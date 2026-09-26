import { router } from 'expo-router';
import Stack from 'expo-router/stack';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitRow } from '@/components/habit-row';
import { AppText, Button, HeaderButton, SectionLabel } from '@/components/ui';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';
import { formatDate } from '@/utils/dates';

export default function HomeScreen() {
  const { habits, completions } = useHabits();
  const colors = useTheme();
  const today = useToday();
  const insets = useSafeAreaInsets();
  const active = habits.filter((habit) => !habit.archived);
  const done = new Set(completions.filter((entry) => entry.date === today).map((entry) => entry.habitId));
  const completed = active.filter((habit) => done.has(habit.id)).length;
  const addHabit = () => router.push('/habit-form');

  return <>
    <Stack.Screen options={{ headerRight: () => <HeaderButton label="Add habit" onPress={addHabit} /> }} />
    <FlatList contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 + insets.bottom, gap: 12, flexGrow: 1 }}
      data={active} keyExtractor={(habit) => String(habit.id)}
      renderItem={({ item }) => <HabitRow habit={item} today={today} completed={done.has(item.id)} />}
      ListHeaderComponent={<View style={{ gap: 16, paddingBottom: 12 }}>
        <SectionLabel>{formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }).toLocaleUpperCase()}</SectionLabel>
        <View style={{ gap: 4 }}>
          <AppText style={{ fontSize: 32, lineHeight: 42, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{completed} / {active.length}</AppText>
          <AppText secondary>{active.length > 0 && completed === active.length ? 'All done for today. Nicely done.' : 'habits completed today'}</AppText>
        </View>
        {active.length > 0 && <View accessibilityRole="progressbar" accessibilityLabel="Today’s progress" accessibilityValue={{ min: 0, max: active.length, now: completed }}
          style={{ height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${completed / active.length * 100}%`, backgroundColor: colors.primary, borderRadius: 3 }} />
        </View>}
      </View>}
      ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18, paddingVertical: 48, paddingHorizontal: 16 }}>
        <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: colors.subtle, alignItems: 'center', justifyContent: 'center' }}><Text accessible={false} style={{ fontSize: 40 }}>🌱</Text></View>
        <AppText style={{ fontSize: 23, lineHeight: 32, fontWeight: '600', textAlign: 'center' }}>Small steps, every day.</AppText>
        <AppText secondary style={{ textAlign: 'center', maxWidth: 280 }}>Choose something you want to make time for. Start with one habit.</AppText>
        <Button label="Create your first habit" onPress={addHabit} />
      </View>} />
  </>;
}
