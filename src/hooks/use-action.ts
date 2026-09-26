import { useRef, useState } from 'react';
import { UserInputError } from '@/models/habit';

export function useAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(action: () => Promise<unknown>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try { await action(); }
    catch (reason) {
      setError(reason instanceof UserInputError ? reason.message : 'Your change could not be saved. Please try again.');
      if (__DEV__) console.error('Habit action failed:', reason);
    } finally { locked.current = false; setBusy(false); }
  }
  return { run, busy, error };
}
