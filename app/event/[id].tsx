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
      Alert.alert(
        "Couldn’t delete",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!event)
    return (
      <Page>
        <Txt>Event not found.</Txt>
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
          Occurred:{" "}
          {event.occurredAt ? formatTime(event.occurredAt) : "Unknown"}
        </Txt>
        <Txt>Discovered: {formatTime(event.discoveredAt)}</Txt>
        {event.timeIsApproximate && (
          <Txt muted>Only discovery time is known.</Txt>
        )}
        {event.poopConsistency && (
          <Txt>Consistency: {event.poopConsistency}</Txt>
        )}
        {event.peeAmount && <Txt>Amount: {event.peeAmount}</Txt>}
        {event.notes && <Txt>{event.notes}</Txt>}
      </Card>
      {change && (
        <Card>
          <Txt>
            {change.brand} {change.product}
          </Txt>
          <Txt>
            {change.amountLiters} L ·{" "}
            {change.changeType === "add" ? "Addition" : "Full replacement"}
          </Txt>
        </Card>
      )}
      <Txt muted>To correct an event, delete it and record it again.</Txt>
      <Button
        title={busy ? "Deleting…" : "Delete event"}
        danger
        disabled={busy}
        onPress={() =>
          Alert.alert(
            "Delete this event?",
            "This cannot be undone. Linked litter data will also be deleted and box totals recalculated.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
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
