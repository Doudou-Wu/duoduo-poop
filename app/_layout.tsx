import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DataProvider } from "../components/DataProvider";
import { useColors } from "../components/ui";
export default function Layout() {
  const c = useColors();
  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.bg },
            headerTintColor: c.text,
            contentStyle: { backgroundColor: c.bg },
            headerShadowVisible: false,
            headerBackTitle: "返回",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="record"
            options={{ title: "记录事件", presentation: "modal" }}
          />
          <Stack.Screen name="settings" options={{ title: "设置" }} />
          <Stack.Screen name="event/[id]" options={{ title: "事件详情" }} />
          <Stack.Screen name="box/[id]" options={{ title: "编辑猫砂盆" }} />
        </Stack>
      </DataProvider>
    </SafeAreaProvider>
  );
}
