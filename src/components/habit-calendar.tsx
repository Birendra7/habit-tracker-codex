import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AppText } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { calendarCells, canCompleteDate, formatDate, monthStart, shiftMonth } from '@/utils/dates';

export function HabitCalendar({ today, createdDate, completed, color, readOnly, busy, onToggle }: {
  today: string; createdDate: string; completed: ReadonlySet<string>; color: string;
  readOnly: boolean; busy: boolean; onToggle: (date: string) => void;
}) {
  const colors = useTheme();
  const { fontScale } = useWindowDimensions();
  const [selectedMonth, setMonth] = useState(() => monthStart(today));
  const month = selectedMonth > monthStart(today) ? monthStart(today) : selectedMonth;
  const cells = calendarCells(month);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  const firstMonth = monthStart(createdDate);
  const lastMonth = monthStart(today);

  return <View style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <AppText style={{ flex: 1, fontWeight: '600', fontSize: 18 }}>{formatDate(month, { month: 'long', year: 'numeric' })}</AppText>
      {([-1, 1] as const).map((offset) => {
        const destination = shiftMonth(month, offset);
        const disabled = destination < firstMonth || destination > lastMonth;
        return <Pressable key={offset} accessibilityRole="button" accessibilityLabel={offset === -1 ? 'Previous month' : 'Next month'}
          accessibilityState={{ disabled }} disabled={disabled} onPress={() => setMonth(destination)}
          style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.subtle, opacity: disabled ? 0.3 : pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 28, color: colors.text }}>{offset === -1 ? '‹' : '›'}</Text>
        </Pressable>;
      })}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, minWidth: Math.max(44, 28 * fontScale) * 7, gap: 6 }}>
        <View style={{ flexDirection: 'row' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => <AppText key={index} secondary accessible={false}
            style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' }}>{label}</AppText>)}
        </View>
        {weeks.map((week, row) => <View key={row} style={{ flexDirection: 'row' }}>
          {week.map((date, column) => {
            if (!date) return <View key={`blank-${column}`} style={{ flex: 1 }} />;
            const checked = completed.has(date);
            const eligible = canCompleteDate(date, createdDate, today);
            const disabled = readOnly || busy || !eligible;
            return <Pressable key={date} accessibilityRole="checkbox"
              accessibilityLabel={formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              accessibilityHint={readOnly ? 'Restore this habit to change its history' : eligible ? 'Double tap to change completion' : undefined}
              accessibilityState={{ checked, disabled }} disabled={disabled} onPress={() => onToggle(date)}
              style={({ pressed }) => ({ flex: 1, minHeight: Math.max(48, 32 * fontScale), padding: 3, alignItems: 'center', justifyContent: 'center', opacity: !eligible ? 0.3 : pressed || busy ? 0.6 : 1 })}>
              <View style={{ minWidth: 36, minHeight: 36, paddingHorizontal: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                backgroundColor: checked ? color : 'transparent', borderColor: date === today ? (checked ? colors.text : colors.primary) : 'transparent', borderWidth: 1.5 }}>
                <Text style={{ fontSize: 15, color: checked ? '#FFFFFF' : colors.text, fontWeight: checked || date === today ? '700' : '400', fontVariant: ['tabular-nums'] }}>{Number(date.slice(-2))}</Text>
              </View>
            </Pressable>;
          })}
        </View>)}
      </View>
    </ScrollView>
    <AppText secondary style={{ fontSize: 13, lineHeight: 20 }}>{readOnly ? 'Your saved history. Restore this habit to check in again.' : 'Tap a day to check in or correct your history.'}</AppText>
  </View>;
}
