import type { SQLiteDatabase } from "expo-sqlite";
import { transaction } from "./transaction";

export const schemaV1 = `
CREATE TABLE litter_boxes (
 id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL CHECK(length(trim(name)) > 0),
 widthCm REAL CHECK(widthCm > 0), lengthCm REAL CHECK(lengthCm > 0), heightCm REAL CHECK(heightCm > 0),
 active INTEGER NOT NULL CHECK(active IN (0,1)), notes TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE TABLE events (
 id TEXT PRIMARY KEY NOT NULL,
 type TEXT NOT NULL CHECK(type IN ('pee','poop','scoop','wash_box','add_litter','replace_litter')),
 locationType TEXT NOT NULL CHECK(locationType IN ('litter_box','floor','bathtub','other')),
 litterBoxId TEXT REFERENCES litter_boxes(id), occurredAt TEXT, discoveredAt TEXT NOT NULL,
 timeIsApproximate INTEGER NOT NULL CHECK(timeIsApproximate IN (0,1)),
 poopConsistency TEXT CHECK(poopConsistency IN ('hard','normal','soft','diarrhea')),
 peeAmount TEXT CHECK(peeAmount IN ('small','medium','large')), notes TEXT,
 createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL,
 CHECK(occurredAt IS NOT NULL OR timeIsApproximate = 1),
 CHECK((locationType = 'litter_box' AND litterBoxId IS NOT NULL) OR
       (locationType IN ('floor','bathtub','other') AND litterBoxId IS NULL)),
 CHECK(type IN ('pee','poop') OR (locationType = 'litter_box' AND litterBoxId IS NOT NULL))
);
CREATE TABLE litter_changes (
 id TEXT PRIMARY KEY NOT NULL, eventId TEXT NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
 litterBoxId TEXT NOT NULL REFERENCES litter_boxes(id), brand TEXT NOT NULL, product TEXT NOT NULL,
 amountLiters REAL NOT NULL CHECK(amountLiters > 0), changeType TEXT NOT NULL CHECK(changeType IN ('add','full_replace')),
 createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE TABLE app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
CREATE INDEX events_time ON events(COALESCE(occurredAt, discoveredAt) DESC);
CREATE INDEX events_box ON events(litterBoxId);
CREATE INDEX changes_box ON litter_changes(litterBoxId);
`;
export async function seedDefaults(db: SQLiteDatabase, uuid: () => string) {
  if (
    await db.getFirstAsync(
      "SELECT key FROM app_settings WHERE key = ?",
      "seeded_v1",
    )
  )
    return;
  const now = new Date().toISOString();
  await db.runAsync(
    "INSERT INTO litter_boxes VALUES (?,?,?,?,?,?,?,?,?)",
    uuid(),
    "小猫砂盆",
    null,
    null,
    null,
    1,
    null,
    now,
    now,
  );
  await db.runAsync(
    "INSERT INTO litter_boxes VALUES (?,?,?,?,?,?,?,?,?)",
    uuid(),
    "大猫砂盆",
    56,
    78,
    18,
    1,
    null,
    now,
    now,
  );
  await db.runAsync(
    "INSERT INTO app_settings VALUES (?,?)",
    "seeded_v1",
    "true",
  );
}
export async function migrate(db: SQLiteDatabase, uuid: () => string) {
  await db.execAsync(
    "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;",
  );
  await transaction(db, async (tx) => {
    const row = await tx.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    );
    if ((row?.user_version ?? 0) > 1)
      throw new Error("请升级多多便便后再打开此数据库。");
    if (!row?.user_version) {
      await tx.execAsync(schemaV1);
      await tx.execAsync("PRAGMA user_version = 1;");
    }
    await seedDefaults(tx, uuid);
    if (
      !(await tx.getFirstAsync(
        "SELECT key FROM app_settings WHERE key = ?",
        "chinese_box_names_v1",
      ))
    ) {
      await tx.runAsync(
        "UPDATE litter_boxes SET name = ? WHERE name = ?",
        "小猫砂盆",
        "Box 1",
      );
      await tx.runAsync(
        "UPDATE litter_boxes SET name = ? WHERE name = ?",
        "大猫砂盆",
        "IKEA SAMLA",
      );
      await tx.runAsync(
        "INSERT INTO app_settings VALUES (?, ?)",
        "chinese_box_names_v1",
        "true",
      );
    }
  });
}
