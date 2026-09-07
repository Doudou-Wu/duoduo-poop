import type { SQLiteDatabase } from "expo-sqlite";
import type { LitterChange } from "../types/models";
export const listChanges = (db: SQLiteDatabase) =>
  db.getAllAsync<LitterChange>("SELECT * FROM litter_changes ORDER BY rowid");
