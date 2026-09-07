import { View } from "react-native";
import type { LitterBox, LocationType } from "../types/models";
import { Button, Txt, s } from "./ui";
export function LocationPicker({
  boxes,
  boxId,
  location,
  onSelect,
  elimination,
}: {
  boxes: LitterBox[];
  boxId: string | null;
  location: LocationType | null;
  onSelect: (location: LocationType, boxId: string | null) => void;
  elimination: boolean;
}) {
  return (
    <View style={{ gap: 10 }}>
      {boxes
        .filter((b) => b.active)
        .map((b) => (
          <Button
            key={b.id}
            title={`📦 ${b.name}`}
            selected={boxId === b.id}
            onPress={() => onSelect("litter_box", b.id)}
          />
        ))}
      {!boxes.some((b) => b.active) && (
        <Txt muted>No active boxes. Activate a box in Boxes.</Txt>
      )}
      {elimination && (
        <View style={s.wrap}>
          {(["floor", "bathtub", "other"] as const).map((loc) => (
            <View key={loc} style={{ flex: 1, minWidth: 90 }}>
              <Button
                key={loc}
                title={
                  { floor: "Floor", bathtub: "Bathtub", other: "Other" }[loc]
                }
                selected={location === loc}
                onPress={() => onSelect(loc, null)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
