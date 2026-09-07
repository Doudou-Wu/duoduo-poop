import { errorMessage } from "../utils/errors";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, AppState } from "react-native";
import { getDatabase } from "../db/database";
import { listBoxes } from "../db/litterBoxes";
import { listEvents } from "../db/events";
import { listChanges } from "../db/litterChanges";
import type { Snapshot } from "../types/models";
import { Page, Txt, Button } from "./ui";
const Context = createContext<
  (Snapshot & { refresh: () => Promise<void> }) | null
>(null);
export function DataProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<Snapshot | null>(null),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const db = await getDatabase();
      const boxes = await listBoxes(db),
        events = await listEvents(db),
        changes = await listChanges(db);
      setData({ boxes, events, changes });
      setError("");
    } catch (e) {
      setError(errorMessage(e, "无法打开本地数据。"));
      throw e;
    }
  }, []);
  useEffect(() => {
    void refresh().catch(() => {});
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh().catch(() => {});
    });
    return () => listener.remove();
  }, [refresh]);
  if (error)
    return (
      <Page>
        <Txt big>无法加载数据</Txt>
        <Txt>{error}</Txt>
        <Button title="重试" onPress={() => void refresh().catch(() => {})} />
      </Page>
    );
  if (!data)
    return (
      <Page>
        <ActivityIndicator />
        <Txt>正在打开多多的日记…</Txt>
      </Page>
    );
  return (
    <Context.Provider value={{ ...data, refresh }}>{children}</Context.Provider>
  );
}
export function useData() {
  const value = useContext(Context);
  if (!value) throw new Error("DataProvider is required.");
  return value;
}
