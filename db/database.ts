import { openDatabaseAsync } from "expo-sqlite";
import { randomUUID } from "expo-crypto";
import { migrate, seedDefaults } from "./migrations";
import type { SQLiteDatabase } from "expo-sqlite";
import { transaction } from "./transaction";
let opening: Promise<SQLiteDatabase> | undefined;
export function getDatabase() {
  if (!opening)
    opening = (async () => {
      const db = await openDatabaseAsync("duoduo-poop.db");
      try {
        await migrate(db, randomUUID);
        return db;
      } catch (error) {
        await db.closeAsync();
        throw error;
      }
    })().catch((error) => {
      opening = undefined;
      throw error;
    });
  return opening;
}
export async function resetData(db: SQLiteDatabase) {
  await transaction(db, async (tx) => {
    await tx.execAsync(
      "DELETE FROM litter_changes; DELETE FROM events; DELETE FROM litter_boxes; DELETE FROM app_settings;",
    );
    await seedDefaults(tx, randomUUID);
  });
}
