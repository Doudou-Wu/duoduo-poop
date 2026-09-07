import { errorMessage } from "../../utils/errors";
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
      Alert.alert("保存失败", errorMessage(e, "请重试。"), [{ text: "确定" }]);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  if (!box)
    return (
      <Page>
        <Txt>未找到猫砂盆。</Txt>
      </Page>
    );
  return (
    <Page>
      <Field label="名称" value={name} onChangeText={setName} />
      <Field
        label="长（厘米）· 选填"
        value={length}
        onChangeText={setLength}
        keyboardType="decimal-pad"
      />
      <Field
        label="宽（厘米）· 选填"
        value={width}
        onChangeText={setWidth}
        keyboardType="decimal-pad"
      />
      <Field
        label="高（厘米）· 选填"
        value={height}
        onChangeText={setHeight}
        keyboardType="decimal-pad"
      />
      <Field
        label="备注 · 选填"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Txt>启用</Txt>
          <Txt muted>记录时显示此猫砂盆。</Txt>
        </View>
        <Switch
          accessibilityLabel="启用此猫砂盆"
          value={active}
          onValueChange={setActive}
        />
      </View>
      <Button
        title={busy ? "正在保存…" : "保存猫砂盆"}
        primary
        disabled={busy}
        onPress={() => void save()}
      />
    </Page>
  );
}
