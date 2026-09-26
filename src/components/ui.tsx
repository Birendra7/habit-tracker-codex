import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, type ScrollViewProps, type TextProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

export function AppText({ style, secondary, ...props }: TextProps & { secondary?: boolean }) {
  const colors = useTheme();
  return <Text selectable {...props} style={[{ color: secondary ? colors.secondary : colors.text, fontSize: 16, lineHeight: 24 }, style]} />;
}

export function Screen({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  return <ScrollView {...props} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled"
    style={{ flex: 1, backgroundColor: colors.background }}
    contentContainerStyle={[{ padding: 20, paddingBottom: 32 + insets.bottom, gap: 24, flexGrow: 1 }, contentContainerStyle]}>{children}</ScrollView>;
}

export function Button({ label, onPress, disabled, busy, secondary, accessibilityLabel }: {
  label: string; onPress: () => void; disabled?: boolean; busy?: boolean; secondary?: boolean; accessibilityLabel?: string;
}) {
  const colors = useTheme();
  const foreground = secondary ? colors.primary : colors.onPrimary;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 52, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, borderCurve: 'continuous',
      backgroundColor: secondary ? colors.subtle : colors.primary, opacity: disabled || busy ? 0.5 : pressed ? 0.75 : 1,
      flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' })}>
    {busy && <ActivityIndicator size="small" color={foreground} />}
    <Text style={{ color: foreground, fontSize: 17, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
  </Pressable>;
}

export function HeaderButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const colors = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 44, minWidth: 44, paddingHorizontal: 6, justifyContent: 'center', opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}>
    <Text style={{ fontSize: 17, fontWeight: '600', color: colors.primary }}>{label}</Text>
  </Pressable>;
}

export function ErrorMessage({ message }: { message: string | null }) {
  const colors = useTheme();
  return message ? <Text selectable accessibilityRole="alert" accessibilityLiveRegion="polite"
    style={{ color: colors.error, fontSize: 15, lineHeight: 22 }}>{message}</Text> : null;
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <AppText secondary style={{ fontSize: 12, lineHeight: 18, fontWeight: '600', letterSpacing: 1.6 }}>{children}</AppText>;
}

export function Surface({ children }: PropsWithChildren) {
  const colors = useTheme();
  return <View style={{ backgroundColor: colors.surface, borderRadius: 20, borderCurve: 'continuous', padding: 20, gap: 16, borderWidth: 1, borderColor: colors.border }}>{children}</View>;
}
