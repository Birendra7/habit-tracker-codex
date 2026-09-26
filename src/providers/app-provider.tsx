import { openDatabaseAsync } from 'expo-sqlite';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import { palettes } from '@/constants/theme';
import { migrateDatabase } from '@/data/database';
import { HabitStore } from '@/data/habit-store';
import { createRepository } from '@/data/repository';
import { HabitStoreContext } from '@/hooks/use-habits';

export function AppProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<HabitStore | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const system = useColorScheme();
  const colors = palettes[system === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    let cancelled = false;
    let activeStore: HabitStore | undefined;
    let close: (() => Promise<void>) | undefined;
    async function initialize() {
      try {
        const database = await openDatabaseAsync('habits.db', { useNewConnection: true });
        close = () => database.closeAsync();
        await migrateDatabase(database);
        const repository = createRepository(database);
        const data = await repository.readAll();
        if (cancelled) { await close(); return; }
        activeStore = new HabitStore(repository, data);
        setStore(activeStore);
      } catch (error) {
        await close?.().catch(() => undefined);
        if (!cancelled) setFailed(true);
        if (__DEV__) console.error('Unable to open habit database:', error);
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      if (activeStore) void activeStore.whenIdle().then(() => close?.()).catch(() => undefined);
    };
  }, [attempt]);

  if (!store) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32, gap: 20 }}>
        <View style={{ gap: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 44 }} accessible={false}>🌱</Text>
          <Text selectable style={{ color: colors.text, fontSize: 24, fontWeight: '600', textAlign: 'center' }}>
            {failed ? 'Let’s try that again' : 'Your habits, right here'}
          </Text>
          <Text selectable accessibilityRole={failed ? 'alert' : 'text'} style={{ color: colors.secondary, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>
            {failed ? 'We couldn’t open your saved habits. Your data has not been reset.' : 'Opening your saved habits…'}
          </Text>
          {failed ? (
            <Pressable accessibilityRole="button" onPress={() => { setFailed(false); setAttempt((value) => value + 1); }}
              style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 16, minHeight: 48 }}>
              <Text style={{ color: colors.onPrimary, fontSize: 17, fontWeight: '600' }}>Try again</Text>
            </Pressable>
          ) : <ActivityIndicator color={colors.primary} accessibilityLabel="Loading saved habits" />}
        </View>
      </ScrollView>
    );
  }
  return <HabitStoreContext value={store}>{children}</HabitStoreContext>;
}
