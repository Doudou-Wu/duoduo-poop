import { useRef, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useData } from "../components/DataProvider";
import { Page, Txt, Heading, Button, Field, s } from "../components/ui";
import { LocationPicker } from "../components/LocationPicker";
import { DateField } from "../components/DateField";
import { labels, icons } from "../components/EventCard";
import {
  eventTypes,
  type EventType,
  type LocationType,
  type PeeAmount,
  type PoopConsistency,
} from "../types/models";
import { createEvent } from "../db/events";
import { getDatabase } from "../db/database";
import { boxStatus } from "../utils/stats";
export default function Record() {
  const params = useLocalSearchParams<{ type: string }>();
  const valid = eventTypes.includes(params.type as EventType);
  const type: EventType = valid ? (params.type as EventType) : "pee";
  const data = useData();
  const elimination = type === "pee" || type === "poop",
    litter = type === "add_litter" || type === "replace_litter";
  const [location, setLocation] = useState<LocationType | null>(null),
    [boxId, setBoxId] = useState<string | null>(null);
  const [details, setDetails] = useState(false),
    [unknown, setUnknown] = useState(false),
    [time, setTime] = useState(new Date()),
    [editedTime, setEditedTime] = useState(false);
  const [notes, setNotes] = useState(""),
    [consistency, setConsistency] = useState<PoopConsistency | null>(null),
    [amount, setAmount] = useState<PeeAmount | null>(null);
  const [brand, setBrand] = useState(""),
    [product, setProduct] = useState(""),
    [liters, setLiters] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const select = (loc: LocationType, id: string | null) => {
    setLocation(loc);
    setBoxId(id);
    if (litter && id) {
      const box = data.boxes.find((b) => b.id === id)!;
      const current = boxStatus(box, data).replacement;
      setBrand(current?.brand ?? "");
      setProduct(current?.product ?? "");
    }
  };
  async function save() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    try {
      const now = new Date().toISOString(),
        chosen = editedTime ? time.toISOString() : now;
      await createEvent(
        await getDatabase(),
        {
          type,
          locationType: location,
          litterBoxId: boxId,
          occurredAt: unknown ? null : chosen,
          discoveredAt: unknown ? chosen : now,
          timeIsApproximate: unknown,
          poopConsistency: consistency,
          peeAmount: amount,
          notes: notes.trim() || null,
        },
        litter
          ? { brand, product, amountLiters: Number(liters.replace(",", ".")) }
          : undefined,
      );
      await data.refresh();
      router.back();
    } catch (error) {
      Alert.alert(
        "Couldn’t save",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  if (!valid)
    return (
      <Page>
        <Txt>Choose an event from Home.</Txt>
        <Button title="Go home" onPress={() => router.replace("/")} />
      </Page>
    );
  return (
    <Page>
      <Txt big>
        {icons[type]} {labels[type]}
      </Txt>
      <Txt muted>
        {elimination
          ? "Choose a location, then save."
          : litter
            ? "A little fresh litter."
            : "Keep Duoduo’s space comfortable."}
      </Txt>
      <Heading>{elimination ? "Where?" : "Which box?"}</Heading>
      <LocationPicker
        boxes={data.boxes}
        boxId={boxId}
        location={location}
        onSelect={select}
        elimination={elimination}
      />
      {litter && (
        <>
          <Heading>Litter details</Heading>
          <Field
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Fatto"
          />
          <Field
            label="Product"
            value={product}
            onChangeText={setProduct}
            placeholder="e.g. Ultra Brilliant"
          />
          <Field
            label="Amount (liters)"
            value={liters}
            onChangeText={setLiters}
            keyboardType="decimal-pad"
            placeholder="e.g. 10"
          />
          <Txt muted>
            {type === "replace_litter"
              ? "Old litter removed; this starts a fresh total."
              : "Adds to the current estimated total."}
          </Txt>
        </>
      )}
      <Button
        title={busy ? "Saving…" : "Save event"}
        primary
        disabled={busy || !location}
        onPress={() => void save()}
      />
      <Button
        title={details ? "Hide details" : "Add details · time, notes & more"}
        onPress={() => setDetails(!details)}
      />
      {details && (
        <>
          <DateField
            label={unknown ? "Discovered at" : "Occurred at"}
            value={time}
            onChange={(date) => {
              setTime(date);
              setEditedTime(true);
            }}
          />
          {elimination && (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Txt>I only know when I discovered it</Txt>
                <Txt muted>Occurrence time will be unknown.</Txt>
              </View>
              <Switch
                accessibilityLabel="I only know when I discovered it"
                value={unknown}
                onValueChange={setUnknown}
              />
            </View>
          )}
          {type === "poop" && (
            <>
              <Heading>Consistency · optional</Heading>
              <View style={s.wrap}>
                {(["hard", "normal", "soft", "diarrhea"] as const).map(
                  (value) => (
                    <Button
                      key={value}
                      title={value}
                      selected={consistency === value}
                      onPress={() =>
                        setConsistency(consistency === value ? null : value)
                      }
                    />
                  ),
                )}
              </View>
            </>
          )}
          {type === "pee" && (
            <>
              <Heading>Amount · optional</Heading>
              <View style={s.wrap}>
                {(["small", "medium", "large"] as const).map((value) => (
                  <Button
                    key={value}
                    title={value}
                    selected={amount === value}
                    onPress={() => setAmount(amount === value ? null : value)}
                  />
                ))}
              </View>
            </>
          )}
          <Field
            label="Notes · optional"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Anything worth remembering?"
          />
        </>
      )}
      <Txt muted>
        {editedTime ? "Using your selected time." : "Time defaults to now."}{" "}
        Saved on this device.
      </Txt>
    </Page>
  );
}
