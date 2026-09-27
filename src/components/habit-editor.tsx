import Stack from 'expo-router/stack';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AppText, Button, ErrorMessage, HeaderButton, Screen, SectionLabel } from '@/components/ui';
import { DEFAULT_HABIT, HABIT_COLORS, HABIT_EMOJIS } from '@/constants/habits';
import { useAction } from '@/hooks/use-action';
import { useTheme } from '@/hooks/use-theme';
import type { Habit, HabitInput } from '@/models/habit';

export function HabitEditor({ habit, pending, onSave, onCancel }: {
  habit?: Habit; pending: boolean; onSave: (input: HabitInput) => Promise<unknown>; onCancel: () => void;
}) {
  const colors = useTheme();
  const [input, setInput] = useState<HabitInput>(habit ?? DEFAULT_HABIT);
  const descriptionRef = useRef<TextInput>(null);
  const action = useAction();
  const busy = pending || action.busy;
  const set = <K extends keyof HabitInput>(key: K, value: HabitInput[K]) => setInput((previous) => ({ ...previous, [key]: value }));
  const save = () => void action.run(() => onSave(input));
  const textInputStyle = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16,
    color: colors.text, padding: 16, fontSize: 17, minHeight: 54 };

  return <Screen automaticallyAdjustKeyboardInsets>
    <Stack.Screen options={{ title: habit ? 'Edit habit' : 'New habit', gestureEnabled: !busy, headerBackVisible: false,
      headerLeft: () => <HeaderButton label="Cancel" disabled={busy} onPress={onCancel} />,
      headerRight: () => <HeaderButton label="Save" disabled={busy || !input.title.trim()} onPress={save} /> }} />
    <View style={{ alignItems: 'center', paddingVertical: 8, gap: 10 }}>
      <View style={{ width: 76, height: 76, borderRadius: 24, borderCurve: 'continuous', backgroundColor: `${input.color}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Text accessible={false} allowFontScaling={false} style={{ fontSize: 38 }}>{input.emoji}</Text>
      </View>
      <AppText secondary style={{ fontSize: 14 }}>A little intention goes a long way.</AppText>
    </View>
    <View style={{ gap: 10 }}>
      <AppText style={{ fontWeight: '600' }}>Title</AppText>
      <TextInput accessibilityLabel="Habit title" placeholder="e.g. Read a little" placeholderTextColor={colors.secondary}
        value={input.title} onChangeText={(value) => set('title', value)} editable={!busy} maxLength={80} autoCapitalize="sentences"
        returnKeyType="next" onSubmitEditing={() => descriptionRef.current?.focus()} style={textInputStyle} />
    </View>
    <View style={{ gap: 10 }}>
      <AppText style={{ fontWeight: '600' }}>Description <AppText secondary style={{ fontSize: 14 }}>optional</AppText></AppText>
      <TextInput ref={descriptionRef} accessibilityLabel="Habit description" placeholder="What does this habit mean to you?" placeholderTextColor={colors.secondary}
        value={input.description} onChangeText={(value) => set('description', value)} editable={!busy} maxLength={500} multiline
        style={{ ...textInputStyle, minHeight: 104, textAlignVertical: 'top' }} />
    </View>
    <View style={{ gap: 12 }}>
      <SectionLabel>CHOOSE AN EMOJI</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {HABIT_EMOJIS.map((emoji) => <Pressable key={emoji} accessibilityRole="button" accessibilityLabel={`Choose ${emoji}`}
          accessibilityState={{ selected: input.emoji === emoji, disabled: busy }} disabled={busy} onPress={() => set('emoji', emoji)}
          style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
            backgroundColor: input.emoji === emoji ? colors.subtle : colors.surface, borderColor: input.emoji === emoji ? colors.primary : colors.border, opacity: pressed ? 0.6 : 1 })}>
          <Text allowFontScaling={false} style={{ fontSize: 25 }}>{emoji}</Text>
        </Pressable>)}
      </View>
    </View>
    <View style={{ gap: 12 }}>
      <SectionLabel>CHOOSE A COLOR</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {HABIT_COLORS.map(({ name, value }) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${name} color`}
          accessibilityState={{ selected: input.color === value, disabled: busy }} disabled={busy} onPress={() => set('color', value)}
          style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: input.color === value ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: value, alignItems: 'center', justifyContent: 'center' }}>
            {input.color === value && <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>✓</Text>}
          </View>
        </Pressable>)}
      </View>
    </View>
    <ErrorMessage message={action.error} />
    <Button label={habit ? 'Save changes' : 'Create habit'} disabled={!input.title.trim()} busy={busy} onPress={save} />
  </Screen>;
}
