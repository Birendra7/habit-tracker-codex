import { router, useLocalSearchParams } from 'expo-router';
import Stack from 'expo-router/stack';
import { Alert, Text, View } from 'react-native';
import { HabitCalendar } from '@/components/habit-calendar';
import { AppText, Button, ErrorMessage, HeaderButton, Screen, SectionLabel, Surface } from '@/components/ui';
import { useAction } from '@/hooks/use-action';
import { useHabits } from '@/hooks/use-habits';
import { useToday } from '@/hooks/use-today';
import { calculateStreaks, formatDate } from '@/utils/dates';
import { completionFeedback } from '@/utils/haptics';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, completions, pending, store, settings } = useHabits();
  const today = useToday();
  const action = useAction();
  const habit = habits.find((item) => item.id === Number(id));
  if (!habit) return <Screen><AppText>This habit could not be found.</AppText><Button label="Go home" onPress={() => router.replace('/')} /></Screen>;
  const completed = new Set(completions.filter((entry) => entry.habitId === habit.id).map((entry) => entry.date));
  const streak = calculateStreaks(completed, today);
  const busy = action.busy || pending.includes(`habit:${habit.id}`);
  const archive = () => Alert.alert('Archive this habit?', 'It will leave Home, and all your history will stay saved in Settings.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Archive', onPress: () => void action.run(async () => { await store.setArchived(habit.id, true); router.back(); }) },
  ]);

  return <Screen>
    <Stack.Screen options={{ title: habit.title, headerRight: habit.archived ? undefined : () => <HeaderButton label="Edit" disabled={busy}
      onPress={() => router.push({ pathname: '/habit-form', params: { id: habit.id } })} /> }} />
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <View style={{ width: 80, height: 80, borderRadius: 26, borderCurve: 'continuous', backgroundColor: `${habit.color}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Text accessible={false} allowFontScaling={false} style={{ fontSize: 40 }}>{habit.emoji}</Text>
      </View>
      {habit.archived && <SectionLabel>ARCHIVED</SectionLabel>}
      {!!habit.description && <AppText secondary style={{ textAlign: 'center' }}>{habit.description}</AppText>}
      <AppText secondary style={{ fontSize: 13 }}>Since {formatDate(habit.createdDate, { month: 'short', day: 'numeric', year: 'numeric' })}</AppText>
    </View>
    <Surface>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        {[{ label: 'Current streak', value: streak.current }, { label: 'Longest streak', value: streak.longest }].map(({ label, value }) => <View key={label} style={{ flex: 1, minWidth: 110, gap: 4 }}>
          <AppText style={{ fontSize: 32, lineHeight: 40, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{value} <AppText secondary style={{ fontSize: 14 }}>{value === 1 ? 'day' : 'days'}</AppText></AppText>
          <AppText secondary style={{ fontSize: 14 }}>{label}</AppText>
        </View>)}
      </View>
    </Surface>
    <HabitCalendar today={today} createdDate={habit.createdDate} completed={completed} color={habit.color} readOnly={habit.archived} busy={busy}
      onToggle={(date) => void action.run(async () => {
        await store.setCompletion(habit.id, date, !completed.has(date));
        completionFeedback(settings.hapticsEnabled);
      })} />
    <ErrorMessage message={action.error} />
    {habit.archived ? <Button label="Restore habit" busy={busy} onPress={() => void action.run(() => store.setArchived(habit.id, false))} />
      : <Button label="Archive habit" secondary disabled={busy} onPress={archive} />}
  </Screen>;
}
