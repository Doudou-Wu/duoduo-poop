import { useRef, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useData } from "../../components/DataProvider";
import { Page, Txt, Field, Button, s } from "../../components/ui";
import { getDatabase } from "../../db/database";
import { updateBox } from "../../db/litterBoxes";
export default function EditBox() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    data = useData(),
    box = data.boxes.find((b) => b.id === id);
  const [name, setName] = useState(box?.name ?? ""),
    [length, setLength] = useState(box?.lengthCm?.toString() ?? ""),
    [width, setWidth] = useState(box?.widthCm?.toString() ?? ""),
    [height, setHeight] = useState(box?.heightCm?.toString() ?? ""),
    [notes, setNotes] = useState(box?.notes ?? ""),
    [active, setActive] = useState(box?.active ?? true),
    [busy, setBusy] = useState(false);
  const saving = useRef(false);
  async function save() {
    if (!box || saving.current) return;
    saving.current = true;
    setBusy(true);
    const number = (value: string) =>
      value.trim() ? Number(value.replace(",", ".")) : null;
    try {
      await updateBox(await getDatabase(), {
        ...box,
        name,
        lengthCm: number(length),
        widthCm: number(width),
        heightCm: number(height),
        notes,
        active,
      });
      await data.refresh();
      router.back();
    } catch (e) {
      Alert.alert(
        "Couldn’t save",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  if (!box)
    return (
      <Page>
        <Txt>Box not found.</Txt>
      </Page>
    );
  return (
    <Page>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="Length (cm) · optional"
        value={length}
        onChangeText={setLength}
        keyboardType="decimal-pad"
      />
      <Field
        label="Width (cm) · optional"
        value={width}
        onChangeText={setWidth}
        keyboardType="decimal-pad"
      />
      <Field
        label="Height (cm) · optional"
        value={height}
        onChangeText={setHeight}
        keyboardType="decimal-pad"
      />
      <Field
        label="Notes · optional"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Txt>Active</Txt>
          <Txt muted>Show this box when recording.</Txt>
        </View>
        <Switch
          accessibilityLabel="Box active"
          value={active}
          onValueChange={setActive}
        />
      </View>
      <Button
        title={busy ? "Saving…" : "Save box"}
        primary
        disabled={busy}
        onPress={() => void save()}
      />
    </Page>
  );
}
