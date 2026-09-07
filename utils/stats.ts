import type { Event, LitterBox, LitterChange, Snapshot } from "../types/models";
import { eventTime, sameDay } from "./dates";
export const isOutside = (e: Event) =>
  (e.type === "pee" || e.type === "poop") &&
  ["floor", "bathtub", "other"].includes(e.locationType ?? "");
export const rate = (success: number, total: number) =>
  total ? `${Math.round((success / total) * 100)}%` : "—";
export function todaySummary(events: Event[], now = new Date()) {
  const today = events.filter((e) => sameDay(eventTime(e), now));
  return {
    pee: today.filter((e) => e.type === "pee").length,
    poop: today.filter((e) => e.type === "poop").length,
    outside: today.filter(isOutside).length,
  };
}
export function litterHistory(boxId: string, data: Snapshot, at = Infinity) {
  const byId = new Map(data.events.map((e) => [e.id, e]));
  return data.changes
    .filter((c) => c.litterBoxId === boxId && byId.has(c.eventId))
    .map((c) => ({ ...c, time: eventTime(byId.get(c.eventId)!) }))
    .filter((c) => Date.parse(c.time) <= at)
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}
export function boxStatus(box: LitterBox, data: Snapshot, at = Date.now()) {
  const history = litterHistory(box.id, data, at);
  const replacement = history
    .filter((c) => c.changeType === "full_replace")
    .at(-1);
  const start = replacement ? history.indexOf(replacement) : 0;
  const current = history.slice(start);
  const amount = current.reduce((sum, c) => sum + c.amountLiters, 0);
  const last = (type: Event["type"]) =>
    data.events
      .filter(
        (e) =>
          e.litterBoxId === box.id &&
          e.type === type &&
          Date.parse(eventTime(e)) <= at,
      )
      .sort((a, b) => Date.parse(eventTime(b)) - Date.parse(eventTime(a)))[0];
  return {
    replacement,
    amount,
    hasLitter: current.length > 0,
    mixed:
      !!replacement &&
      current.some(
        (c) =>
          c.brand !== replacement.brand || c.product !== replacement.product,
      ),
    last,
  };
}
export interface RateRow {
  key: string;
  success: number;
  total: number;
}
export function insights(data: Snapshot) {
  const overall = (type: "pee" | "poop") => {
    const events = data.events.filter((e) => e.type === type);
    return {
      success: events.filter((e) => e.locationType === "litter_box").length,
      total: events.length,
    };
  };
  const products = new Map<string, RateRow>();
  const ages: RateRow[] = ["0–1 days", "2–3 days", "4–7 days", "8+ days"].map(
    (key) => ({ key, success: 0, total: 0 }),
  );
  let excluded = 0;
  // Outside events have no box ID. Count a failure for each box with a known
  // replacement at that time; in-box poop counts only for the box used.
  // These are box-context observations, not independent animal-level events.
  // Unknown occurrence times are excluded from contextual statistics.
  for (const event of data.events.filter((e) => e.type === "poop")) {
    if (!event.occurredAt || event.timeIsApproximate) {
      excluded++;
      continue;
    }
    const boxes = event.litterBoxId
      ? data.boxes.filter((b) => b.id === event.litterBoxId)
      : data.boxes;
    let counted = false;
    for (const box of boxes) {
      const replacement = litterHistory(
        box.id,
        data,
        Date.parse(event.occurredAt),
      )
        .filter((c) => c.changeType === "full_replace")
        .at(-1);
      if (!replacement) continue;
      counted = true;
      const key = `${replacement.brand} · ${replacement.product}`;
      const row = products.get(key) ?? { key, success: 0, total: 0 };
      const success = event.litterBoxId === box.id ? 1 : 0;
      row.success += success;
      row.total++;
      products.set(key, row);
      const days = Math.floor(
        (Date.parse(event.occurredAt) - Date.parse(replacement.time)) /
          86400000,
      );
      const age = ages[days <= 1 ? 0 : days <= 3 ? 1 : days <= 7 ? 2 : 3];
      age.success += success;
      age.total++;
    }
    if (!counted) excluded++;
  }
  return {
    pee: overall("pee"),
    poop: overall("poop"),
    products: [...products.values()],
    ages,
    excluded,
    outside: ["floor", "bathtub", "other"].map((key) => ({
      key,
      count: data.events.filter((e) => isOutside(e) && e.locationType === key)
        .length,
    })),
    usage: data.boxes.map((box) => ({
      box,
      pee: data.events.filter(
        (e) => e.type === "pee" && e.litterBoxId === box.id,
      ).length,
      poop: data.events.filter(
        (e) => e.type === "poop" && e.litterBoxId === box.id,
      ).length,
    })),
  };
}
