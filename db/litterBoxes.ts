import type { SQLiteDatabase } from "expo-sqlite";
import type { LitterBox } from "../types/models";
export async function listBoxes(db: SQLiteDatabase): Promise<LitterBox[]> {
  const rows = await db.getAllAsync<
    Omit<LitterBox, "active"> & { active: number }
  >("SELECT * FROM litter_boxes ORDER BY rowid");
  return rows.map((row) => ({ ...row, active: !!row.active }));
}
export async function updateBox(db: SQLiteDatabase, box: LitterBox) {
  if (!box.name.trim()) throw new Error("请输入猫砂盆名称。");
  for (const value of [box.widthCm, box.lengthCm, box.heightCm]) {
    if (value !== null && (!Number.isFinite(value) || value <= 0))
      throw new Error("尺寸必须大于零。");
  }
  await db.runAsync(
    "UPDATE litter_boxes SET name=?,widthCm=?,lengthCm=?,heightCm=?,active=?,notes=?,updatedAt=? WHERE id=?",
    box.name.trim(),
    box.widthCm,
    box.lengthCm,
    box.heightCm,
    Number(box.active),
    box.notes?.trim() || null,
    new Date().toISOString(),
    box.id,
  );
}
