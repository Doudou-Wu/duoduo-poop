// Real SQLite on disk, with Expo's asynchronous API shape. Native bridge is
// intentionally not simulated: device testing is still required for that layer.
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
export class TestDatabase {
  connection: DatabaseSync;
  databasePath: string;
  ownedDirectory?: string;
  constructor(path: string) {
    if (path === ":memory:") {
      this.ownedDirectory = mkdtempSync(join(tmpdir(), "duoduo-native-test-"));
      path = join(this.ownedDirectory, "journal.db");
    }
    this.databasePath = path;
    this.connection = new DatabaseSync(path);
  }
  async execAsync(sql: string) {
    this.connection.exec(sql);
  }
  async runAsync(sql: string, ...params: (string | number | null)[]) {
    return this.connection.prepare(sql).run(...params);
  }
  async getFirstAsync<T>(sql: string, ...params: (string | number | null)[]) {
    return this.connection.prepare(sql).get(...params) as T | undefined;
  }
  async getAllAsync<T>(sql: string, ...params: (string | number | null)[]) {
    return this.connection.prepare(sql).all(...params) as T[];
  }
  async withTransactionAsync(fn: () => Promise<void>) {
    this.connection.exec("BEGIN IMMEDIATE");
    try {
      await fn();
      this.connection.exec("COMMIT");
    } catch (e) {
      this.connection.exec("ROLLBACK");
      throw e;
    }
  }
  async closeAsync() {
    this.connection.close();
    if (this.ownedDirectory) {
      const target = resolve(this.ownedDirectory);
      if (!target.startsWith(resolve(tmpdir()) + sep + "duoduo-native-test-"))
        throw new Error("Unexpected test cleanup path");
      rmSync(target, { recursive: true, force: true });
    }
  }
}
export const openDatabaseAsync = async (
  name: string,
  _options?: unknown,
  directory?: string,
) => new TestDatabase(directory ? join(directory, name) : name);
