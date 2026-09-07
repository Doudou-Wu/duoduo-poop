import { Pressable, Text } from "react-native";
import { useColors } from "./ui";
export function QuickEventButton({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48%",
        flexGrow: 1,
        minHeight: 122,
        borderRadius: 20,
        padding: 20,
        gap: 12,
        backgroundColor: c.soft,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <Text style={{ fontSize: 30 }}>{icon}</Text>
      <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>
        {title}
      </Text>
    </Pressable>
  );
}
