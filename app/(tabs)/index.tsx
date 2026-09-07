import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { router } from "expo-router";
import { useData } from "../../components/DataProvider";
import { Page, Txt, Heading, Card, Button, s } from "../../components/ui";
import { QuickEventButton } from "../../components/QuickEventButton";
import { EventCard } from "../../components/EventCard";
import { todaySummary } from "../../utils/stats";
export default function Home() {
  const data = useData();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const summary = todaySummary(data.events, now);
  return (
    <Page>
      <Txt big>Duoduo Poop 🐱</Txt>
      <Txt muted>A little care, every day.</Txt>
      <Card>
        <Txt muted>TODAY</Txt>
        <View style={{ ...s.row, justifyContent: "space-between" }}>
          {[
            { label: "Pee", value: summary.pee },
            { label: "Poop", value: summary.poop },
            { label: "Outside box", value: summary.outside },
          ].map((x) => (
            <View key={x.label}>
              <Txt big>{x.value}</Txt>
              <Txt muted>{x.label}</Txt>
            </View>
          ))}
        </View>
      </Card>
      <Heading>Log a moment</Heading>
      <View style={s.wrap}>
        <QuickEventButton
          title="Pee"
          icon="💧"
          onPress={() => router.push("/record?type=pee")}
        />
        <QuickEventButton
          title="Poop"
          icon="💩"
          onPress={() => router.push("/record?type=poop")}
        />
        <QuickEventButton
          title="Clean"
          icon="🧹"
          onPress={() =>
            Alert.alert("Clean a box", "What did you do?", [
              {
                text: "Scoop",
                onPress: () => router.push("/record?type=scoop"),
              },
              {
                text: "Wash box",
                onPress: () => router.push("/record?type=wash_box"),
              },
              { text: "Cancel", style: "cancel" },
            ])
          }
        />
        <QuickEventButton
          title="Litter"
          icon="➕"
          onPress={() =>
            Alert.alert("Litter care", "What did you do?", [
              {
                text: "Add litter",
                onPress: () => router.push("/record?type=add_litter"),
              },
              {
                text: "Full replacement",
                onPress: () => router.push("/record?type=replace_litter"),
              },
              { text: "Cancel", style: "cancel" },
            ])
          }
        />
      </View>
      <Heading>Recent activity</Heading>
      {data.events.slice(0, 10).map((event) => (
        <EventCard key={event.id} event={event} boxes={data.boxes} />
      ))}
      {!data.events.length && (
        <Card>
          <Txt>Your journal starts here.</Txt>
          <Txt muted>Tap Pee or Poop, choose a location, and save.</Txt>
        </Card>
      )}
      <Button title="Settings" onPress={() => router.push("/settings")} />
    </Page>
  );
}
