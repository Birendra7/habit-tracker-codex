import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { AppText, ErrorMessage } from '@/components/ui';
import { useAction } from '@/hooks/use-action';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import type { Habit } from '@/models/habit';
import { canCompleteDate } from '@/utils/dates';
import { completionFeedback } from '@/utils/haptics';

export function HabitRow({ habit, today, completed = false }: { habit: Habit; today?: string; completed?: boolean }) {
  const colors = useTheme();
  const { store, pending, settings } = useHabits();
  const action = useAction();
  const saving = pending.includes(`habit:${habit.id}`) || action.busy;
  const canCheck = !!today && !habit.archived && canCompleteDate(today, habit.createdDate, today);

  return <View style={{ gap: 8 }}>
    <View style={{ backgroundColor: colors.surface, borderRadius: 20, borderCurve: 'continuous', borderColor: colors.border, borderWidth: 1,
      flexDirection: 'row', alignItems: 'center', paddingRight: 12 }}>
      <Link href={{ pathname: '/habit/[id]', params: { id: habit.id } }} asChild>
        <Pressable accessibilityRole="button" accessibilityLabel={`${habit.title}. View habit history`}
          style={({ pressed }) => ({ flex: 1, flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, opacity: pressed ? 0.6 : 1 })}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: `${habit.color}20`, borderLeftWidth: 3, borderLeftColor: habit.color, alignItems: 'center', justifyContent: 'center' }}>
            <Text accessible={false} style={{ fontSize: 25 }}>{habit.emoji}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText style={{ fontSize: 17, fontWeight: '600' }}>{habit.title}</AppText>
            {!!habit.description && <AppText secondary numberOfLines={2} style={{ fontSize: 14, lineHeight: 20 }}>{habit.description}</AppText>}
          </View>
        </Pressable>
      </Link>
      {today ? (
        <Pressable accessibilityRole="checkbox" accessibilityLabel={`Complete ${habit.title} for today`}
          accessibilityHint="Double tap to mark or unmark this habit" accessibilityState={{ checked: completed, disabled: saving || !canCheck, busy: saving }}
          disabled={saving || !canCheck} onPress={() => void action.run(async () => {
            await store.setCompletion(habit.id, today, !completed);
            completionFeedback(settings.hapticsEnabled);
          })} style={({ pressed }) => ({ width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed || saving || !canCheck ? 0.5 : 1 })}>
          <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: completed ? 0 : 1.5, borderColor: colors.disabled,
            backgroundColor: completed ? habit.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {saving ? <ActivityIndicator size="small" color={completed ? '#FFFFFF' : colors.primary} /> : completed ? (
              <Animated.Text entering={FadeIn.duration(140).reduceMotion(ReduceMotion.System)} style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>✓</Animated.Text>
            ) : null}
          </View>
        </Pressable>
      ) : <Text accessible={false} style={{ fontSize: 24, color: colors.secondary, paddingRight: 8 }}>›</Text>}
    </View>
    <ErrorMessage message={action.error} />
  </View>;
}
