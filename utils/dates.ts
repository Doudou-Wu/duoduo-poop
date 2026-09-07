import type { Event } from "../types/models";
export const eventTime = (event: Event) =>
  event.occurredAt ?? event.discoveredAt;
export function formatTime(value?: string | null) {
  return value
    ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded yet";
}
export function sameDay(a: string, b = new Date()) {
  return new Date(a).toDateString() === b.toDateString();
}
