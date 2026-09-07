import { errorMessage } from "../utils/errors";
import { consistencyLabels, amountLabels } from "../utils/labels";
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
      Alert.alert("保存失败", errorMessage(error, "请重试。"), [
        { text: "确定" },
      ]);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  if (!valid)
    return (
      <Page>
        <Txt>请从首页选择要记录的事件。</Txt>
        <Button title="返回首页" onPress={() => router.replace("/")} />
      </Page>
    );
  return (
    <Page>
      <Txt big>
        {icons[type]} {labels[type]}
      </Txt>
      <Txt muted>
        {elimination
          ? "选择位置后保存。"
          : litter
            ? "添些新鲜猫砂。"
            : "让多多的小空间保持舒适。"}
      </Txt>
      <Heading>{elimination ? "在哪里？" : "哪个猫砂盆？"}</Heading>
      <LocationPicker
        boxes={data.boxes}
        boxId={boxId}
        location={location}
        onSelect={select}
        elimination={elimination}
      />
      {litter && (
        <>
          <Heading>猫砂详情</Heading>
          <Field
            label="品牌"
            value={brand}
            onChangeText={setBrand}
            placeholder="例如：Fatto"
          />
          <Field
            label="产品"
            value={product}
            onChangeText={setProduct}
            placeholder="例如：Ultra Brilliant"
          />
          <Field
            label="用量（升）"
            value={liters}
            onChangeText={setLiters}
            keyboardType="decimal-pad"
            placeholder="例如：10"
          />
          <Txt muted>
            {type === "replace_litter"
              ? "旧猫砂已清空，猫砂总量将重新计算。"
              : "将计入当前猫砂估算总量。"}
          </Txt>
        </>
      )}
      <Button
        title={busy ? "正在保存…" : "保存事件"}
        primary
        disabled={busy || !location}
        onPress={() => void save()}
      />
      <Button
        title={details ? "收起详情" : "添加详情 · 时间、备注等"}
        onPress={() => setDetails(!details)}
      />
      {details && (
        <>
          <DateField
            label={unknown ? "发现时间" : "发生时间"}
            value={time}
            onChange={(date) => {
              setTime(date);
              setEditedTime(true);
            }}
          />
          {elimination && (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Txt>我只知道发现时间</Txt>
                <Txt muted>发生时间将标记为未知。</Txt>
              </View>
              <Switch
                accessibilityLabel="我只知道发现时间"
                value={unknown}
                onValueChange={setUnknown}
              />
            </View>
          )}
          {type === "poop" && (
            <>
              <Heading>便便性状 · 选填</Heading>
              <View style={s.wrap}>
                {(["hard", "normal", "soft", "diarrhea"] as const).map(
                  (value) => (
                    <Button
                      key={value}
                      title={consistencyLabels[value]}
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
              <Heading>尿量 · 选填</Heading>
              <View style={s.wrap}>
                {(["small", "medium", "large"] as const).map((value) => (
                  <Button
                    key={value}
                    title={amountLabels[value]}
                    selected={amount === value}
                    onPress={() => setAmount(amount === value ? null : value)}
                  />
                ))}
              </View>
            </>
          )}
          <Field
            label="备注 · 选填"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="有什么想记下的吗？"
          />
        </>
      )}
      <Txt muted>
        {editedTime ? "使用你选择的时间。" : "默认使用当前时间。"} 保存在本机。
      </Txt>
    </Page>
  );
}
