# Habit Tracker

A minimal, offline habit tracker for iOS and Android. Built with Expo SDK 57, React Native, Expo Router native tabs, and SQLite.

## Run

Use Node.js 24 and Bun. Install dependencies from the lockfile:

```sh
bun install --frozen-lockfile
bunx expo start --go
```

Open the project in an Expo Go version that supports SDK 57. Scan the terminal QR code on a phone on the same network. The app uses Expo Go's bundled SQLite and haptics modules; no custom native build is needed for these features. The browser entry only explains that tracking is available on mobile.

## Features

- Home shows active habits and today's completion count. Tap the check circle to complete or undo; tap a habit to view history.
- Create or edit a title, optional description, emoji, and color. New habits start today.
- Each habit has current and longest streaks and a Monday-first monthly calendar. Correct any day from creation through today.
- Archive habits without deleting their history. Restore them from Settings → Archived habits.
- Settings offers System/Light/Dark appearance and optional completion haptics.
- Empty, loading, missing-habit, and recoverable save/startup error states are included.

## Local data

`habits.db` lives in the app's SQLite directory. It contains habits, a unique completion per habit/calendar date, and application settings. There is no account, server, telemetry, or network requirement for tracking.

Migrations use `PRAGMA user_version` and transactions. Writes are serialized, parameterized, and reflected in shared UI state only after committing. Archiving keeps all progress. App restarts preserve data; uninstalling the app or clearing its storage can remove it. Backup, restore, and cloud sync are outside this version.

Dates are stored as local `YYYY-MM-DD` values, never derived from a UTC timestamp. Historical dates remain fixed during timezone changes. A current streak can end yesterday while today is still incomplete. Archived gaps are not automatically filled when a habit is restored.

## Project layout

- `src/app/`: root stack, Home/Settings tab stacks, shared habit details, and modal editor routes.
- `src/components/`: reusable mobile controls, habit rows, editor, and calendar.
- `src/data/`: database schema/migrations, repository, and observable state with coordinated writes.
- `src/hooks/`, `src/providers/`, `src/utils/`: preferences, startup/retry, date changes, and streak calculations.
- `tests/sqlite-adapter.ts`: test adapter that runs production SQL against Node's real SQLite engine.

## Checks

```sh
bunx expo lint
bunx tsc --noEmit
bun run test
bunx expo-doctor
bunx expo export --platform ios --platform android --output-dir dist/native
```

Start Expo once after adding routes so that it generates the ignored `.expo/types/router.d.ts` file. Tests cover database reopen persistence, migration safety, duplicate/failed writes, streaks, calendar boundaries, forms, check-offs, archive/restore, settings, startup retry, and day rollover. Native hardware checks are listed in [the validation notes](docs/validation.md).

### Windows route types

Bun automatically applies `patches/@expo%2Frouter-server@57.0.11.patch`. It normalizes Windows separators before checking whether watched files belong to the route directory and before stripping `/index` from generated types. Without it, this SDK version can generate routes for sibling components and reject the valid `/` route. The patch has a regression test; remove it once the project upgrades to an upstream version containing the fixes.

ESLint is pinned to major version 9 for compatibility with this SDK's React lint rules.

## First version boundaries

Habits are daily, with one completion per day. Custom schedules, numeric goals, reminders, permanent deletion, cloud sync, file backup/restore, and browser tracking are deferred. UI follows the Expo building-native-ui skill, with system fonts, native navigation, accessible controls, restrained color, and reduced-motion-aware feedback.
