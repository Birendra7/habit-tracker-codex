import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitRow } from '@/components/habit-row';
import { AppText } from '@/components/ui';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';

export default function ArchivedScreen() {
  const { habits } = useHabits();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  return <FlatList contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }}
    contentContainerStyle={{ padding: 20, paddingBottom: 32 + insets.bottom, gap: 12, flexGrow: 1 }}
    data={habits.filter((habit) => habit.archived)} keyExtractor={(habit) => String(habit.id)}
    ListHeaderComponent={<AppText secondary style={{ paddingBottom: 12 }}>Your history stays here. Open a habit to look back or bring it back to Home.</AppText>}
    renderItem={({ item }) => <HabitRow habit={item} />}
    ListEmptyComponent={<View style={{ paddingVertical: 64, gap: 10, alignItems: 'center' }}>
      <AppText style={{ fontSize: 22, fontWeight: '600' }}>Nothing archived</AppText>
      <AppText secondary style={{ textAlign: 'center' }}>Habits you archive will appear here.</AppText>
    </View>} />;
}
