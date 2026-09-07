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
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="record"
            options={{ title: "Record event", presentation: "modal" }}
          />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen
            name="event/[id]"
            options={{ title: "Event details" }}
          />
          <Stack.Screen name="box/[id]" options={{ title: "Edit box" }} />
        </Stack>
      </DataProvider>
    </SafeAreaProvider>
  );
}
