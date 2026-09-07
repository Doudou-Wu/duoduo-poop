import { router } from "expo-router";
import { Card, Txt, Button } from "./ui";
import type { LitterBox, Snapshot } from "../types/models";
import { boxStatus } from "../utils/stats";
import { eventTime, formatTime } from "../utils/dates";
export function LitterBoxCard({
  box,
  data,
}: {
  box: LitterBox;
  data: Snapshot;
}) {
  const status = boxStatus(box, data);
  return (
    <Card>
      <Txt big>📦 {box.name}</Txt>
      <Txt muted>
        {box.active ? "Active" : "Inactive"} · {box.lengthCm ?? "—"} ×{" "}
        {box.widthCm ?? "—"} × {box.heightCm ?? "—"} cm (L × W × H)
      </Txt>
      <Txt>
        {status.replacement
          ? `${status.replacement.brand} ${status.replacement.product}`
          : "Current product not established"}
      </Txt>
      <Txt big>
        {status.hasLitter ? `${Math.round(status.amount * 100) / 100} L` : "—"}
      </Txt>
      <Txt muted>
        {status.replacement
          ? "Estimated from replacement + additions"
          : "Recorded additions; starting amount unknown"}
      </Txt>
      {status.mixed && (
        <Txt muted>Includes additions of a different product.</Txt>
      )}
      <Txt muted>Estimate does not subtract scooped or lost litter.</Txt>
      {(
        [
          { type: "replace_litter", label: "Full replacement" },
          { type: "add_litter", label: "Litter addition" },
          { type: "scoop", label: "Scoop" },
          { type: "wash_box", label: "Wash" },
          { type: "pee", label: "Pee" },
          { type: "poop", label: "Poop" },
        ] as const
      ).map(({ type, label }) => {
        const e = status.last(type);
        return (
          <Txt key={type}>
            {label}: {formatTime(e ? eventTime(e) : null)}
            {e?.timeIsApproximate ? " (discovered)" : ""}
          </Txt>
        );
      })}
      {box.notes && <Txt muted>{box.notes}</Txt>}
      <Button
        title="Edit box"
        onPress={() =>
          router.push({ pathname: "/box/[id]", params: { id: box.id } })
        }
      />
    </Card>
  );
}
