import { useState } from "react";
import { Platform, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Txt, s } from "./ui";
export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [mode, setMode] = useState<"date" | "time" | null>(null);
  return (
    <View style={{ gap: 8 }}>
      <Txt muted>{label}</Txt>
      <View style={s.wrap}>
        <Button
          title={value.toLocaleDateString("zh-CN")}
          onPress={() => setMode(mode === "date" ? null : "date")}
        />
        <Button
          title={value.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
          onPress={() => setMode(mode === "time" ? null : "time")}
        />
      </View>
      {mode && (
        <>
          <DateTimePicker
            value={value}
            locale="zh-CN"
            is24Hour
            positiveButton={{ label: "确定" }}
            negativeButton={{ label: "取消" }}
            mode={mode}
            maximumDate={new Date()}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              if (Platform.OS !== "ios") setMode(null);
              if (event.type !== "dismissed" && date) onChange(date);
            }}
          />
          {Platform.OS === "ios" && (
            <Button title="完成" onPress={() => setMode(null)} />
          )}
        </>
      )}
    </View>
  );
}
