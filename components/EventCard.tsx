import { Pressable, View } from "react-native";
import { router } from "expo-router";
import type { Event, EventType, LitterBox } from "../types/models";
import { Card, Txt, s } from "./ui";
import { eventTime, formatTime } from "../utils/dates";
export const labels: Record<EventType, string> = {
  pee: "Pee",
  poop: "Poop",
  scoop: "Scooped",
  wash_box: "Washed box",
  add_litter: "Added litter",
  replace_litter: "Replaced litter",
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
    ? (boxes.find((b) => b.id === event.litterBoxId)?.name ?? "Unknown box")
    : {
        floor: "Floor",
        bathtub: "Bathtub",
        other: "Other",
        litter_box: "Litter box",
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
      accessibilityLabel={`${labels[event.type]}, ${locationName(event, boxes)}, ${formatTime(eventTime(event))}. View details`}
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
              {event.timeIsApproximate ? " · Discovered" : ""}
            </Txt>
          </View>
          <Txt muted>›</Txt>
        </View>
        {event.notes ? <Txt muted>{event.notes}</Txt> : null}
      </Card>
    </Pressable>
  );
}
