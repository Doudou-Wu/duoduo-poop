import { errorMessage } from "../utils/errors";
import { useState } from "react";
import { Alert, Share } from "react-native";
import { useData } from "../components/DataProvider";
import { Page, Txt, Card, Button, Field } from "../components/ui";
import { getDatabase, resetData } from "../db/database";
export default function Settings() {
  const data = useData();
  const [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false);
  async function reset() {
    setBusy(true);
    try {
      await resetData(await getDatabase());
      await data.refresh();
      setConfirm("");
      Alert.alert("数据已重置", "已恢复两个默认猫砂盆。", [{ text: "确定" }]);
    } catch (e) {
      Alert.alert("重置失败", errorMessage(e, "请重试。"), [{ text: "确定" }]);
    } finally {
      setBusy(false);
    }
  }
  async function debug() {
    try {
      await Share.share({
        message: JSON.stringify(
          {
            app: "多多便便",
            version: "0.1.0",
            schema: 1,
            exportedAt: new Date().toISOString(),
            counts: {
              boxes: data.boxes.length,
              events: data.events.length,
              litterChanges: data.changes.length,
            },
          },
          null,
          2,
        ),
      });
    } catch (e) {
      Alert.alert("分享失败", errorMessage(e, "请重试。"), [{ text: "确定" }]);
    }
  }
  return (
    <Page>
      <Txt big>为多多而做</Txt>
      <Card>
        <Txt>第一阶段 · 本地日记</Txt>
        <Txt muted>
          记录保存在本机。请保留 Expo Go
          的应用数据，清除应用数据可能会删除日记。
        </Txt>
        <Button title="分享诊断信息" onPress={() => void debug()} />
        <Txt muted>仅分享版本和记录数量，不包含备份数据。</Txt>
      </Card>
      <Card>
        <Txt>重置全部应用数据</Txt>
        <Txt muted>
          永久删除全部事件、猫砂变更、猫砂盆编辑和偏好设置，并恢复小猫砂盆和大猫砂盆。
        </Txt>
        <Field
          label="输入“重置”以继续"
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button
          title={busy ? "正在重置…" : "重置全部数据"}
          danger
          disabled={confirm !== "重置" || busy}
          onPress={() =>
            Alert.alert(
              "永久清空全部数据？",
              "此操作无法撤销，本机的全部记录都将丢失。",
              [
                { text: "保留数据", style: "cancel" },
                {
                  text: "清空全部数据",
                  style: "destructive",
                  onPress: () => void reset(),
                },
              ],
            )
          }
        />
      </Card>
    </Page>
  );
}
