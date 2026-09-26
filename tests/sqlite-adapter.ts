import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { Database } from '../src/data/database';

// Runs the production SQL against real SQLite without requiring a mobile simulator.
export function openTestDatabase(path = ':memory:') {
  const sqlite = new DatabaseSync(path);
  const adapter = {
    async execAsync(sql: string) { sqlite.exec(sql); },
    async runAsync(sql: string, ...params: SQLInputValue[]) {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async getFirstAsync<T>(sql: string, ...params: SQLInputValue[]) {
      return (sqlite.prepare(sql).get(...params) as T | undefined) ?? null;
    },
    async getAllAsync<T>(sql: string, ...params: SQLInputValue[]) {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    async withExclusiveTransactionAsync(action: (db: Database) => Promise<void>) {
      sqlite.exec('BEGIN IMMEDIATE');
      try { await action(adapter as Database); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db: adapter as Database, close: () => sqlite.close() };
}
