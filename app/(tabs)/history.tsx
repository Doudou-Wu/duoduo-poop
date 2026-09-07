import { useState } from "react";
import { FlatList, View } from "react-native";
import { useData } from "../../components/DataProvider";
import { EventCard } from "../../components/EventCard";
import { Button, Txt, useColors, s } from "../../components/ui";
const filters = {
  All: [],
  Pee: ["pee"],
  Poop: ["poop"],
  Cleaning: ["scoop", "wash_box"],
  Litter: ["add_litter", "replace_litter"],
};
export default function History() {
  const data = useData(),
    c = useColors();
  const [filter, setFilter] = useState<keyof typeof filters>("All");
  const events = data.events.filter(
    (e) => filter === "All" || (filters[filter] as string[]).includes(e.type),
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        contentContainerStyle={s.page}
        data={events}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 14 }}>
            <Txt big>Duoduo’s journal</Txt>
            <View style={s.wrap}>
              {(Object.keys(filters) as (keyof typeof filters)[]).map((key) => (
                <Button
                  key={key}
                  title={key}
                  selected={filter === key}
                  onPress={() => setFilter(key)}
                />
              ))}
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <EventCard event={item} boxes={data.boxes} />}
        ListEmptyComponent={<Txt muted>No events here yet.</Txt>}
      />
    </View>
  );
}
