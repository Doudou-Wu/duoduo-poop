import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SQLiteDatabase } from "expo-sqlite";
import { TestDatabase } from "./sqlite-adapter";
import { migrate } from "../db/migrations";
import { transaction } from "../db/transaction";
import { resetData } from "../db/database";
import {
  createEvent,
  deleteEvent,
  listEvents,
  validateEvent,
} from "../db/events";
import { listBoxes, updateBox } from "../db/litterBoxes";
import { listChanges } from "../db/litterChanges";
import { boxStatus, insights, todaySummary } from "../utils/stats";
import type { EventInput, EventType, Snapshot } from "../types/models";
async function snapshot(db: SQLiteDatabase): Promise<Snapshot> {
  return {
    boxes: await listBoxes(db),
    events: await listEvents(db),
    changes: await listChanges(db),
  };
}
function input(
  type: EventType,
  boxId: string | null,
  time = new Date().toISOString(),
): EventInput {
  return {
    type,
    locationType: boxId ? "litter_box" : "floor",
    litterBoxId: boxId,
    occurredAt: time,
    discoveredAt: time,
    timeIsApproximate: false,
    poopConsistency: null,
    peeAmount: null,
    notes: null,
  };
}
test("Acceptance A–I: seed, log, persist, litter 10+3, wash, insights, reset", async () => {
  const dir = mkdtempSync(join(tmpdir(), "duoduo-db-")),
    path = join(dir, "journal.db");
  let native = new TestDatabase(path),
    db = native as unknown as SQLiteDatabase;
  try {
    await migrate(db, randomUUID);
    await migrate(db, randomUUID);
    let data = await snapshot(db);
    assert.equal(data.boxes.length, 2);
    assert.deepEqual(
      data.boxes.map((b) => b.name),
      ["小猫砂盆", "大猫砂盆"],
    );
    assert.deepEqual(
      [data.boxes[1].lengthCm, data.boxes[1].widthCm, data.boxes[1].heightCm],
      [78, 56, 18],
    );
    assert.equal(data.events.length, 0);
    assert.equal(insights(data).poop.total, 0);
    const [box1, box2] = data.boxes;
    await createEvent(db, input("pee", box1.id));
    await native.closeAsync();
    native = new TestDatabase(path);
    db = native as unknown as SQLiteDatabase;
    await migrate(db, randomUUID);
    assert.equal((await listEvents(db)).length, 1);
    assert.equal((await listBoxes(db)).length, 2);
    await createEvent(db, input("poop", box2.id));
    await createEvent(db, input("poop", null));
    data = await snapshot(db);
    assert.deepEqual(todaySummary(data.events), {
      pee: 1,
      poop: 2,
      outside: 1,
    });
    const replacement = await createEvent(
      db,
      input("replace_litter", box2.id),
      { brand: "Fatto", product: "Ultra Brilliant", amountLiters: 10 },
    );
    data = await snapshot(db);
    assert.equal(boxStatus(box2, data).amount, 10);
    assert.equal(boxStatus(box2, data).replacement?.product, "Ultra Brilliant");
    const addition = await createEvent(db, input("add_litter", box2.id), {
      brand: "Fatto",
      product: "Ultra Brilliant",
      amountLiters: 3,
    });
    data = await snapshot(db);
    assert.equal(boxStatus(box2, data).amount, 13);
    await createEvent(db, input("wash_box", box2.id));
    data = await snapshot(db);
    assert.ok(boxStatus(box2, data).last("wash_box"));
    assert.deepEqual(insights(data).poop, { success: 1, total: 2 });
    await native.closeAsync();
    native = new TestDatabase(path);
    db = native as unknown as SQLiteDatabase;
    await migrate(db, randomUUID);
    data = await snapshot(db);
    assert.equal(data.events.length, 6);
    assert.equal(boxStatus(box2, data).amount, 13);
    await deleteEvent(db, addition);
    data = await snapshot(db);
    assert.equal(boxStatus(box2, data).amount, 10);
    assert.equal(data.changes.length, 1);
    await deleteEvent(db, replacement);
    assert.equal((await listChanges(db)).length, 0);
    await updateBox(db, { ...box1, name: "Quiet corner", active: false });
    await assert.rejects(createEvent(db, input("pee", box1.id)), /已停用/);
    await migrate(db, randomUUID);
    assert.equal((await listBoxes(db))[0].name, "Quiet corner");
    await resetData(db);
    await migrate(db, randomUUID);
    data = await snapshot(db);
    assert.equal(data.events.length, 0);
    assert.equal(data.changes.length, 0);
    assert.equal(data.boxes.length, 2);
    assert.equal(data.boxes[0].name, "小猫砂盆");
    assert.equal(
      (await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))
        ?.user_version,
      1,
    );
  } finally {
    await native.closeAsync();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("Atomic litter save rolls back if its second insert fails", async () => {
  const native = new TestDatabase(":memory:"),
    db = native as unknown as SQLiteDatabase;
  try {
    await migrate(db, randomUUID);
    await transaction(db, async (tx) => {
      assert.equal(
        (
          await tx.getFirstAsync<{ foreign_keys: number }>(
            "PRAGMA foreign_keys",
          )
        )?.foreign_keys,
        1,
      );
      assert.equal(
        (
          await tx.getFirstAsync<{ user_version: number }>(
            "PRAGMA user_version",
          )
        )?.user_version,
        1,
      );
    });
    const box = (await listBoxes(db))[0];
    await db.execAsync(
      "CREATE TRIGGER reject_change BEFORE INSERT ON litter_changes BEGIN SELECT RAISE(ABORT, 'test failure'); END;",
    );
    await assert.rejects(
      createEvent(db, input("replace_litter", box.id), {
        brand: "Fatto",
        product: "Ultra",
        amountLiters: 10,
      }),
      /test failure/,
    );
    assert.equal((await listEvents(db)).length, 0);
    assert.equal((await listChanges(db)).length, 0);
  } finally {
    await native.closeAsync();
  }
});
test("Validation rejects incomplete or invalid records", () => {
  assert.throws(
    () => validateEvent({ ...input("pee", null), locationType: null }),
    /位置/,
  );
  assert.throws(() => validateEvent(input("wash_box", null)), /猫砂盆/);
  assert.throws(
    () =>
      validateEvent(input("add_litter", "box"), {
        brand: "F",
        product: "U",
        amountLiters: -1,
      }),
    /大于零/,
  );
  assert.throws(
    () => validateEvent({ ...input("pee", null), occurredAt: null }),
    /估计时间/,
  );
  assert.doesNotThrow(() =>
    validateEvent({
      ...input("poop", null),
      occurredAt: null,
      timeIsApproximate: true,
    }),
  );
});
test("Backdated replacement, product attribution, age buckets and unknown times", async () => {
  const native = new TestDatabase(":memory:"),
    db = native as unknown as SQLiteDatabase;
  try {
    await migrate(db, randomUUID);
    const [a, b] = await listBoxes(db);
    // Seeded boxes normally start now; move creation back to model an existing journal.
    await db.runAsync(
      "UPDATE litter_boxes SET createdAt=?",
      "2026-01-01T00:00:00.000Z",
    );
    const day = (n: number) =>
      `2026-01-${String(n).padStart(2, "0")}T12:00:00.000Z`;
    await createEvent(db, input("replace_litter", a.id, day(1)), {
      brand: "A",
      product: "Original",
      amountLiters: 10,
    });
    await createEvent(db, input("replace_litter", b.id, day(1)), {
      brand: "B",
      product: "Other",
      amountLiters: 8,
    });
    for (const n of [2, 3, 5, 9])
      await createEvent(db, input("poop", a.id, day(n)));
    await createEvent(db, input("poop", null, day(3)));
    await createEvent(db, {
      ...input("poop", null, day(3)),
      occurredAt: null,
      timeIsApproximate: true,
    });
    await createEvent(db, input("add_litter", a.id, day(10)), {
      brand: "Mixed",
      product: "Addition",
      amountLiters: 3,
    });
    let data = await snapshot(db),
      stats = insights(data);
    assert.deepEqual(
      stats.ages.map((x) => [x.success, x.total]),
      [
        [1, 1],
        [1, 3],
        [1, 1],
        [1, 1],
      ],
    );
    assert.equal(
      stats.products.find((x) => x.key === "A · Original")?.total,
      5,
    );
    assert.equal(stats.products.find((x) => x.key === "B · Other")?.success, 0);
    assert.equal(stats.excluded, 1);
    assert.equal(boxStatus(a, data).amount, 13);
    assert.equal(boxStatus(a, data).mixed, true);
    await createEvent(db, input("replace_litter", a.id, day(8)), {
      brand: "New",
      product: "Fresh",
      amountLiters: 7,
    });
    data = await snapshot(db);
    assert.equal(boxStatus(a, data).amount, 10);
    assert.equal(boxStatus(a, data).replacement?.brand, "New");
    assert.equal(
      insights(data).products.find((x) => x.key === "New · Fresh")?.success,
      1,
    );
  } finally {
    await native.closeAsync();
  }
});

test("Chinese default names migrate existing records once and preserve edits", async () => {
  const native = new TestDatabase(":memory:"),
    db = native as unknown as SQLiteDatabase;
  try {
    await migrate(db, randomUUID);
    const [small, large] = await listBoxes(db);
    await updateBox(db, { ...small, name: "Box 1" });
    await updateBox(db, { ...large, name: "IKEA SAMLA" });
    await createEvent(db, input("poop", large.id));
    await db.runAsync(
      "DELETE FROM app_settings WHERE key = ?",
      "chinese_box_names_v1",
    );
    await migrate(db, randomUUID);
    const boxes = await listBoxes(db);
    assert.deepEqual(
      boxes.map((b) => b.name),
      ["小猫砂盆", "大猫砂盆"],
    );
    assert.deepEqual(
      boxes.map((b) => b.id),
      [small.id, large.id],
    );
    assert.equal((await listEvents(db))[0].litterBoxId, large.id);
    await updateBox(db, { ...boxes[0], name: "窗边的盆" });
    await migrate(db, randomUUID);
    assert.equal((await listBoxes(db))[0].name, "窗边的盆");
  } finally {
    await native.closeAsync();
  }
});
