# Validation notes

## Automated checks

Run `bunx expo lint`, `bunx tsc --noEmit`, and `bun run test` from the project root. Node.js 24 is required for the real SQLite tests. Node may print its experimental SQLite notice; tests do not use a simulated SQL parser.

The suites cover:

- Empty database initialization, idempotent migrations, foreign keys, and rejection of an unknown future schema version.
- Habit creation and editing, single-per-day check-ins, undo, archive/restore, date bounds, and parameterized quoted input.
- Habits, progress, and preferences surviving closure and reopening of an on-disk database.
- Duplicate pending actions, rejection of conflicting actions, failed-write recovery, and independent writes.
- Local dates near midnight, leap years, year/month boundaries, DST dates, gaps, corrections, and streaks.
- Form validation, all habit fields, save failure/retry without losing input, accessible checkboxes, and Home totals.
- Read-only archived history, restoration, archive confirmation, appearance, and haptics settings.
- Database startup failure/retry, local midnight updates, and immediate refresh on app resume.
- Windows Expo route typing.

For a DST-specific run in PowerShell:

```powershell
$env:TZ = 'America/New_York'
bun run test --selectProjects logic
Remove-Item Env:TZ
```

Native production bundle validation:

```sh
bunx expo export --platform ios --platform android --output-dir dist/native
```

## Expo Go device checklist

The development environment is Windows, without an available Android emulator or iOS simulator. Native bundle builds and component tests do not replace visual/device verification. Complete this checklist on both platforms:

1. Launch in Expo Go; confirm exactly Home and Settings tabs and an empty habit list.
2. Create two habits with different emojis/colors and a long title/description. Save, edit, and cancel an edit. Confirm the keyboard never covers the focused input or prevents reaching Save.
3. Check and uncheck a habit. Confirm the daily count updates without moving rows. Rapid taps must not duplicate progress.
4. Open details. Confirm the current and longest streaks, Monday-first calendar, and disabled future/pre-creation dates. After the habit is at least one day old, correct a prior day and verify both streaks update.
5. Archive a completed habit. Confirm its history remains in Settings, its days are read-only, and restoring brings it back with the same progress and original list order.
6. Choose Light, Dark, and System appearances. Toggle haptics and test a check-in on a device with haptic hardware.
7. Force-close and reopen the app. Confirm habits, progress, archived state, and preferences remain. Repeat in airplane mode.
8. Test near local midnight and after backgrounding overnight. Confirm Home changes to the new day. Timezone changes must not move previously recorded dates.
9. Test large system text, VoiceOver/TalkBack, reduced motion, and a small display. Verify readable colors, completion announcements, tappable dates, safe areas, and unobstructed native tabs.

Export/restore after uninstall and browser persistence are intentionally outside this version.
