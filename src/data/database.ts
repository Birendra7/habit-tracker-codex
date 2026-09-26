import type { SQLiteDatabase } from 'expo-sqlite';

export type Database = Pick<SQLiteDatabase, 'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync' | 'withExclusiveTransactionAsync'>;

export async function migrateDatabase(db: Database) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  await db.withExclusiveTransactionAsync(async (transaction) => {
    const version = await transaction.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if ((version?.user_version ?? 0) > 1) throw new Error('This database requires a newer version of the app.');
    if (version?.user_version === 1) return;
    await transaction.execAsync(`
      CREATE TABLE habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(trim(title)) > 0),
        description TEXT NOT NULL DEFAULT '',
        emoji TEXT NOT NULL,
        color TEXT NOT NULL,
        created_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0, 1))
      );
      CREATE TABLE completions (
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE RESTRICT,
        date TEXT NOT NULL,
        PRIMARY KEY (habit_id, date)
      ) WITHOUT ROWID;
      CREATE TABLE app_settings (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        appearance TEXT NOT NULL CHECK(appearance IN ('system', 'light', 'dark')),
        haptics_enabled INTEGER NOT NULL CHECK(haptics_enabled IN (0, 1))
      );
      INSERT INTO app_settings VALUES (1, 'system', 1);
      PRAGMA user_version = 1;
    `);
  });
}
