import { errorMessage } from "../../utils/errors";
import { consistencyLabels, amountLabels } from "../../utils/labels";
import { useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useData } from "../../components/DataProvider";
import { Page, Txt, Card, Button } from "../../components/ui";
import { icons, labels, locationName } from "../../components/EventCard";
import { formatTime } from "../../utils/dates";
import { deleteEvent } from "../../db/events";
import { getDatabase } from "../../db/database";
export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    data = useData(),
    event = data.events.find((e) => e.id === id),
    change = data.changes.find((c) => c.eventId === id);
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    try {
      await deleteEvent(await getDatabase(), id);
      await data.refresh();
      router.back();
    } catch (e) {
      Alert.alert("删除失败", errorMessage(e, "请重试。"), [{ text: "确定" }]);
    } finally {
      setBusy(false);
    }
  }
  if (!event)
    return (
      <Page>
        <Txt>未找到事件。</Txt>
      </Page>
    );
  return (
    <Page>
      <Txt big>
        {icons[event.type]} {labels[event.type]}
      </Txt>
      <Card>
        <Txt>{locationName(event, data.boxes)}</Txt>
        <Txt>
          发生时间： {event.occurredAt ? formatTime(event.occurredAt) : "未知"}
        </Txt>
        <Txt>发现时间： {formatTime(event.discoveredAt)}</Txt>
        {event.timeIsApproximate && <Txt muted>仅知道发现时间。</Txt>}
        {event.poopConsistency && (
          <Txt>便便性状：{consistencyLabels[event.poopConsistency]}</Txt>
        )}
        {event.peeAmount && <Txt>尿量：{amountLabels[event.peeAmount]}</Txt>}
        {event.notes && <Txt>{event.notes}</Txt>}
      </Card>
      {change && (
        <Card>
          <Txt>
            {change.brand} {change.product}
          </Txt>
          <Txt>
            {change.amountLiters} 升 ·{" "}
            {change.changeType === "add" ? "添加猫砂" : "全部换砂"}
          </Txt>
        </Card>
      )}
      <Txt muted>如需更正，请删除此事件后重新记录。</Txt>
      <Button
        title={busy ? "正在删除…" : "删除事件"}
        danger
        disabled={busy}
        onPress={() =>
          Alert.alert(
            "删除此事件？",
            "此操作无法撤销。关联的猫砂数据也将删除，并重新计算猫砂总量。",
            [
              { text: "取消", style: "cancel" },
              {
                text: "删除",
                style: "destructive",
                onPress: () => void remove(),
              },
            ],
          )
        }
      />
    </Page>
  );
}
