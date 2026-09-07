import { Pressable, View } from "react-native";
import { router } from "expo-router";
import type { Event, EventType, LitterBox } from "../types/models";
import { Card, Txt, s } from "./ui";
import { eventTime, formatTime } from "../utils/dates";
export const labels: Record<EventType, string> = {
  pee: "尿尿",
  poop: "便便",
  scoop: "铲砂",
  wash_box: "清洗猫砂盆",
  add_litter: "添加猫砂",
  replace_litter: "全部换砂",
};
export const icons: Record<EventType, string> = {
  pee: "💧",
  poop: "💩",
  scoop: "🧹",
  wash_box: "🧼",
  add_litter: "➕",
  replace_litter: "📦",
};
export function locationName(event: Event, boxes: LitterBox[]) {
  return event.litterBoxId
    ? (boxes.find((b) => b.id === event.litterBoxId)?.name ?? "未知猫砂盆")
    : {
        floor: "地板",
        bathtub: "浴缸",
        other: "其他",
        litter_box: "猫砂盆",
      }[event.locationType ?? "other"];
}
export function EventCard({
  event,
  boxes,
}: {
  event: Event;
  boxes: LitterBox[];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${labels[event.type]}, ${locationName(event, boxes)}, ${formatTime(eventTime(event))}。查看详情`}
      onPress={() =>
        router.push({ pathname: "/event/[id]", params: { id: event.id } })
      }
    >
      <Card>
        <View style={s.row}>
          <Txt big>{icons[event.type]}</Txt>
          <View style={{ flex: 1 }}>
            <Txt>
              {labels[event.type]} · {locationName(event, boxes)}
            </Txt>
            <Txt muted>
              {formatTime(eventTime(event))}
              {event.timeIsApproximate ? " · 发现时间" : ""}
            </Txt>
          </View>
          <Txt muted>›</Txt>
        </View>
        {event.notes ? <Txt muted>{event.notes}</Txt> : null}
      </Card>
    </Pressable>
  );
}
