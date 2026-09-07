import React from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
} from "react-native";
export function useColors() {
  const dark = useColorScheme() === "dark";
  return dark
    ? {
        bg: "#141917",
        card: "#202923",
        text: "#F1F4EF",
        muted: "#B1BDB3",
        line: "#3A493F",
        accent: "#A5D3B4",
        onAccent: "#133222",
        soft: "#2D4334",
        danger: "#FFB3AB",
      }
    : {
        bg: "#F5F6F0",
        card: "#FFFFFF",
        text: "#24372C",
        muted: "#66746B",
        line: "#DDE4DC",
        accent: "#2D6247",
        onAccent: "#FFFFFF",
        soft: "#E6EFE3",
        danger: "#AC3535",
      };
}
export function Page({ children }: React.PropsWithChildren) {
  const c = useColors();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.page}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Txt({
  children,
  muted = false,
  big = false,
}: React.PropsWithChildren<{ muted?: boolean; big?: boolean }>) {
  const c = useColors();
  return (
    <Text
      style={{
        color: muted ? c.muted : c.text,
        fontSize: big ? 28 : 16,
        lineHeight: big ? 35 : 24,
        fontWeight: big ? "700" : "400",
      }}
    >
      {children}
    </Text>
  );
}
export function Heading({ children }: React.PropsWithChildren) {
  const c = useColors();
  return (
    <Text
      accessibilityRole="header"
      style={{ color: c.text, fontSize: 20, fontWeight: "700", marginTop: 12 }}
    >
      {children}
    </Text>
  );
}
export function Card({ children }: React.PropsWithChildren) {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.card, borderColor: c.line }]}>
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  selected = false,
  primary = false,
  disabled = false,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  selected?: boolean;
  primary?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: primary ? c.accent : selected ? c.soft : c.card,
          borderColor: selected ? c.accent : c.line,
          opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "600",
          color: primary ? c.onAccent : danger ? c.danger : c.text,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Txt muted>{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...props}
        style={[
          s.input,
          { color: c.text, borderColor: c.line, backgroundColor: c.card },
          props.style,
        ]}
      />
    </View>
  );
}
export const s = StyleSheet.create({
  page: { padding: 20, gap: 14, paddingBottom: 40 },
  card: { padding: 18, borderRadius: 18, borderWidth: 1, gap: 8 },
  button: {
    padding: 15,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 50,
    fontSize: 17,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  wrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
