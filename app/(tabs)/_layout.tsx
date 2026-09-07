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
        { name: "index", title: "首页", icon: "⌂" },
        { name: "history", title: "历史", icon: "≡" },
        { name: "boxes", title: "猫砂盆", icon: "□" },
        { name: "insights", title: "统计", icon: "◴" },
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
