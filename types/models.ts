export const eventTypes = [
  "pee",
  "poop",
  "scoop",
  "wash_box",
  "add_litter",
  "replace_litter",
] as const;
export type EventType = (typeof eventTypes)[number];
export type LocationType = "litter_box" | "floor" | "bathtub" | "other";
export type PoopConsistency = "hard" | "normal" | "soft" | "diarrhea";
export type PeeAmount = "small" | "medium" | "large";
export interface LitterBox {
  id: string;
  name: string;
  widthCm: number | null;
  lengthCm: number | null;
  heightCm: number | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Event {
  id: string;
  type: EventType;
  locationType: LocationType | null;
  litterBoxId: string | null;
  occurredAt: string | null;
  discoveredAt: string;
  timeIsApproximate: boolean;
  poopConsistency: PoopConsistency | null;
  peeAmount: PeeAmount | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface LitterChange {
  id: string;
  eventId: string;
  litterBoxId: string;
  brand: string;
  product: string;
  amountLiters: number;
  changeType: "add" | "full_replace";
  createdAt: string;
  updatedAt: string;
}
export type EventInput = Omit<Event, "id" | "createdAt" | "updatedAt">;
export type LitterInput = Pick<
  LitterChange,
  "brand" | "product" | "amountLiters"
>;
export interface Snapshot {
  boxes: LitterBox[];
  events: Event[];
  changes: LitterChange[];
}
