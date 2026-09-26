import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDateKey, millisecondsUntilNextDay } from '@/utils/dates';

export function useToday() {
  const [today, setToday] = useState(() => localDateKey());
  useEffect(() => {
    let midnight: ReturnType<typeof setTimeout>;
    const refresh = () => {
      setToday(localDateKey());
      clearTimeout(midnight);
      midnight = setTimeout(refresh, millisecondsUntilNextDay());
    };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const clockCheck = setInterval(refresh, 60_000);
    return () => { clearTimeout(midnight); clearInterval(clockCheck); subscription.remove(); };
  }, []);
  return today;
}
