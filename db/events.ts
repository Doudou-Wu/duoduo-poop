import type { SQLiteDatabase } from "expo-sqlite";
import { randomUUID } from "expo-crypto";
import { transaction } from "./transaction";
import {
  eventTypes,
  type Event,
  type EventInput,
  type LitterInput,
} from "../types/models";
export async function listEvents(db: SQLiteDatabase): Promise<Event[]> {
  const rows = await db.getAllAsync<
    Omit<Event, "timeIsApproximate"> & { timeIsApproximate: number }
  >(
    "SELECT * FROM events ORDER BY COALESCE(occurredAt,discoveredAt) DESC, rowid DESC",
  );
  return rows.map((row) => ({
    ...row,
    timeIsApproximate: !!row.timeIsApproximate,
  }));
}
export function validateEvent(input: EventInput, litter?: LitterInput) {
  if (!eventTypes.includes(input.type))
    throw new Error("Choose an event type.");
  const elimination = input.type === "pee" || input.type === "poop";
  if (
    !input.locationType ||
    !["litter_box", "floor", "bathtub", "other"].includes(input.locationType)
  )
    throw new Error("Choose a location.");
  if (
    input.locationType === "litter_box"
      ? !input.litterBoxId
      : !!input.litterBoxId
  )
    throw new Error("Choose a valid box or location.");
  if (!elimination && input.locationType !== "litter_box")
    throw new Error("Choose a litter box.");
  if (
    !Number.isFinite(Date.parse(input.discoveredAt)) ||
    (input.occurredAt !== null &&
      !Number.isFinite(Date.parse(input.occurredAt)))
  )
    throw new Error("Choose a valid date and time.");
  if (!input.occurredAt && !input.timeIsApproximate)
    throw new Error("Unknown time must be marked approximate.");
  if (input.occurredAt && input.occurredAt > input.discoveredAt)
    throw new Error("Occurrence cannot be after discovery.");
  if (Date.parse(input.discoveredAt) > Date.now() + 60000)
    throw new Error("Time cannot be in the future.");
  if (
    input.poopConsistency &&
    (input.type !== "poop" ||
      !["hard", "normal", "soft", "diarrhea"].includes(input.poopConsistency))
  )
    throw new Error("Invalid poop consistency.");
  if (
    input.peeAmount &&
    (input.type !== "pee" ||
      !["small", "medium", "large"].includes(input.peeAmount))
  )
    throw new Error("Invalid pee amount.");
  const needsLitter =
    input.type === "add_litter" || input.type === "replace_litter";
  if (
    needsLitter &&
    (!litter?.brand.trim() ||
      !litter.product.trim() ||
      !Number.isFinite(litter.amountLiters) ||
      litter.amountLiters <= 0)
  )
    throw new Error("Enter a brand, product and positive amount in liters.");
  if (!needsLitter && litter)
    throw new Error("Litter details only belong to litter events.");
}
export async function createEvent(
  db: SQLiteDatabase,
  input: EventInput,
  litter?: LitterInput,
  uuid = randomUUID,
) {
  validateEvent(input, litter);
  const id = uuid(),
    now = new Date().toISOString();
  await transaction(db, async (tx) => {
    if (input.litterBoxId) {
      const box = await tx.getFirstAsync<{ active: number }>(
        "SELECT active FROM litter_boxes WHERE id=?",
        input.litterBoxId,
      );
      if (!box?.active)
        throw new Error(
          "This box is inactive. Activate it in Boxes before logging.",
        );
    }
    await tx.runAsync(
      "INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      id,
      input.type,
      input.locationType,
      input.litterBoxId,
      input.occurredAt,
      input.discoveredAt,
      Number(input.timeIsApproximate),
      input.poopConsistency,
      input.peeAmount,
      input.notes?.trim() || null,
      now,
      now,
    );
    if (litter)
      await tx.runAsync(
        "INSERT INTO litter_changes VALUES (?,?,?,?,?,?,?,?,?)",
        uuid(),
        id,
        input.litterBoxId!,
        litter.brand.trim(),
        litter.product.trim(),
        litter.amountLiters,
        input.type === "replace_litter" ? "full_replace" : "add",
        now,
        now,
      );
  });
  return id;
}
export async function deleteEvent(db: SQLiteDatabase, id: string) {
  await db.runAsync("DELETE FROM events WHERE id=?", id);
}
