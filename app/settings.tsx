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
      Alert.alert("Data reset", "The two default boxes are ready.");
    } catch (e) {
      Alert.alert(
        "Reset failed",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function debug() {
    try {
      await Share.share({
        message: JSON.stringify(
          {
            app: "Duoduo Poop",
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
      Alert.alert(
        "Couldn’t share",
        e instanceof Error ? e.message : "Please try again.",
      );
    }
  }
  return (
    <Page>
      <Txt big>Made for Duoduo</Txt>
      <Card>
        <Txt>Phase 1 · local journal</Txt>
        <Txt muted>
          Your records live in SQLite on this device. Keep Expo Go’s app data to
          keep your journal. Removing its data can erase the journal.
        </Txt>
        <Button title="Share debug info" onPress={() => void debug()} />
        <Txt muted>Shares version and counts only. This is not a backup.</Txt>
      </Card>
      <Card>
        <Txt>Reset all app data</Txt>
        <Txt muted>
          Permanently deletes every event, litter change, box edit and
          preference. Restores Box 1 and IKEA SAMLA.
        </Txt>
        <Field
          label="Type RESET to continue"
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button
          title={busy ? "Resetting…" : "Reset all data"}
          danger
          disabled={confirm !== "RESET" || busy}
          onPress={() =>
            Alert.alert(
              "Permanently erase all data?",
              "There is no undo. All records on this device will be lost.",
              [
                { text: "Keep my data", style: "cancel" },
                {
                  text: "Erase all data",
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
