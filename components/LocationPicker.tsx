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
        <Txt muted>暂无启用的猫砂盆，请在“猫砂盆”页面启用。</Txt>
      )}
      {elimination && (
        <View style={s.wrap}>
          {(["floor", "bathtub", "other"] as const).map((loc) => (
            <View key={loc} style={{ flex: 1, minWidth: 90 }}>
              <Button
                key={loc}
                title={{ floor: "地板", bathtub: "浴缸", other: "其他" }[loc]}
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
