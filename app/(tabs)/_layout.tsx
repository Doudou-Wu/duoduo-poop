import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useColors } from "../../components/ui";
export default function Layout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.text,
        headerShadowVisible: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line },
      }}
    >
      {[
        { name: "index", title: "Home", icon: "⌂" },
        { name: "history", title: "History", icon: "≡" },
        { name: "boxes", title: "Boxes", icon: "□" },
        { name: "insights", title: "Insights", icon: "◴" },
      ].map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 25 }}>{t.icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
