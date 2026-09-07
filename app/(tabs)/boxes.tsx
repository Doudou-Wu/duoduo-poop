import { useData } from "../../components/DataProvider";
import { Page, Txt } from "../../components/ui";
import { LitterBoxCard } from "../../components/LitterBoxCard";
export default function Boxes() {
  const data = useData();
  return (
    <Page>
      <Txt big>A space for Duoduo</Txt>
      <Txt muted>Litter and care, box by box.</Txt>
      {data.boxes.map((box) => (
        <LitterBoxCard key={box.id} box={box} data={data} />
      ))}
      {!data.boxes.length && (
        <Txt>No boxes yet. Reset in Settings to restore defaults.</Txt>
      )}
    </Page>
  );
}
