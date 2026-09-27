import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { Pressable, Switch, Text, View } from 'react-native';
import { AppText, ErrorMessage, Screen, SectionLabel, Surface } from '@/components/ui';
import { useAction } from '@/hooks/use-action';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import type { Appearance } from '@/models/habit';

const appearances: { value: Appearance; label: string }[] = [
  { value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { settings, store, pending, habits } = useHabits();
  const colors = useTheme();
  const action = useAction();
  const saving = action.busy || pending.includes('settings');
  return <Screen>
    <View style={{ gap: 12 }}>
      <SectionLabel>MAKE IT YOURS</SectionLabel>
      <Surface>
        <AppText style={{ fontWeight: '600' }}>Appearance</AppText>
        <View accessibilityRole="radiogroup" accessibilityLabel="Appearance" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {appearances.map(({ value, label }) => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={label}
            accessibilityState={{ checked: settings.appearance === value, disabled: saving }} disabled={saving}
            onPress={() => void action.run(() => store.saveSettings({ ...settings, appearance: value }))}
            style={({ pressed }) => ({ flexGrow: 1, minWidth: 76, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12,
              backgroundColor: settings.appearance === value ? colors.primary : colors.subtle, opacity: pressed || saving ? 0.6 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: settings.appearance === value ? colors.onPrimary : colors.text }}>{label}</Text>
          </Pressable>)}
        </View>
        <AppText secondary style={{ fontSize: 14 }}>System follows your phone’s appearance.</AppText>
      </Surface>
      <Surface>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText style={{ fontWeight: '600' }}>Completion haptics</AppText>
            <AppText secondary style={{ fontSize: 14, lineHeight: 20 }}>A little feedback when you check in.</AppText>
          </View>
          <Switch accessibilityLabel="Completion haptics" disabled={saving} value={settings.hapticsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            onValueChange={(enabled) => void action.run(() => store.saveSettings({ ...settings, hapticsEnabled: enabled }))} />
        </View>
      </Surface>
      <ErrorMessage message={action.error} />
    </View>
    <View style={{ gap: 12 }}>
      <SectionLabel>YOUR HABITS</SectionLabel>
      <Link href="/settings/archived" asChild>
        <Pressable accessibilityRole="button" style={({ pressed }) => ({ backgroundColor: colors.surface, borderRadius: 20, borderCurve: 'continuous', borderColor: colors.border,
          borderWidth: 1, padding: 20, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.6 : 1 })}>
          <AppText style={{ flex: 1, fontWeight: '600' }}>Archived habits</AppText>
          <AppText secondary style={{ fontVariant: ['tabular-nums'] }}>{habits.filter((habit) => habit.archived).length}</AppText>
          <Text accessible={false} allowFontScaling={false} style={{ fontSize: 23, color: colors.secondary }}>›</Text>
        </Pressable>
      </Link>
    </View>
    <View style={{ gap: 6, paddingVertical: 8 }}>
      <AppText secondary style={{ fontSize: 14 }}>Habit Tracker · {Constants.expoConfig?.version ?? '1.0.0'}</AppText>
      <AppText secondary style={{ fontSize: 14, lineHeight: 21 }}>Your habits and progress are saved on this phone and work offline.</AppText>
    </View>
  </Screen>;
}
