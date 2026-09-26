import * as Haptics from 'expo-haptics';

export function completionFeedback(enabled: boolean) {
  if (!enabled || process.env.EXPO_OS === 'web') return;
  void Haptics.selectionAsync().catch(() => undefined);
}
