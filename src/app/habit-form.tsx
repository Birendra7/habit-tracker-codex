import { router, useLocalSearchParams } from 'expo-router';
import { HabitEditor } from '@/components/habit-editor';
import { AppText, Button, Screen } from '@/components/ui';
import { useHabits } from '@/hooks/use-habits';

export default function HabitFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { habits, pending, store } = useHabits();
  const habit = id ? habits.find((item) => item.id === Number(id)) : undefined;
  const close = () => router.canGoBack() ? router.back() : router.replace('/');
  if (id && (!habit || habit.archived)) return <Screen>
    <AppText>{habit?.archived ? 'Restore this habit before editing it.' : 'This habit could not be found.'}</AppText>
    <Button label="Go back" onPress={close} />
  </Screen>;
  return <HabitEditor key={id ?? 'new'} habit={habit} pending={pending.includes(habit ? `habit:${habit.id}` : 'create')}
    onCancel={close} onSave={async (input) => {
      if (habit) await store.updateHabit(habit.id, input);
      else await store.createHabit(input);
      close();
    }} />;
}
