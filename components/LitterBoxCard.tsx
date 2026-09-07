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
        {box.active ? "启用" : "已停用"} · {box.lengthCm ?? "—"} ×{" "}
        {box.widthCm ?? "—"} × {box.heightCm ?? "—"} 厘米（长 × 宽 × 高）
      </Txt>
      <Txt>
        {status.replacement
          ? `${status.replacement.brand} ${status.replacement.product}`
          : "尚未确定当前猫砂产品"}
      </Txt>
      <Txt big>
        {status.hasLitter ? `${Math.round(status.amount * 100) / 100} 升` : "—"}
      </Txt>
      <Txt muted>
        {status.replacement
          ? "根据换砂量和添加量估算"
          : "仅包含已记录的添加量，初始用量未知"}
      </Txt>
      {status.mixed && <Txt muted>包含其他产品的添加量。</Txt>}
      <Txt muted>估算量未扣除铲出或损耗的猫砂。</Txt>
      {(
        [
          { type: "replace_litter", label: "全部换砂" },
          { type: "add_litter", label: "添加猫砂" },
          { type: "scoop", label: "铲砂" },
          { type: "wash_box", label: "清洗" },
          { type: "pee", label: "尿尿" },
          { type: "poop", label: "便便" },
        ] as const
      ).map(({ type, label }) => {
        const e = status.last(type);
        return (
          <Txt key={type}>
            {label}: {formatTime(e ? eventTime(e) : null)}
            {e?.timeIsApproximate ? "（发现时间）" : ""}
          </Txt>
        );
      })}
      {box.notes && <Txt muted>{box.notes}</Txt>}
      <Button
        title="编辑猫砂盆"
        onPress={() =>
          router.push({ pathname: "/box/[id]", params: { id: box.id } })
        }
      />
    </Card>
  );
}
