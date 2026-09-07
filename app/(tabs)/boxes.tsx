import { useData } from "../../components/DataProvider";
import { Page, Txt } from "../../components/ui";
import { LitterBoxCard } from "../../components/LitterBoxCard";
export default function Boxes() {
  const data = useData();
  return (
    <Page>
      <Txt big>多多的小空间</Txt>
      <Txt muted>记录每个猫砂盆的猫砂与清洁情况。</Txt>
      {data.boxes.map((box) => (
        <LitterBoxCard key={box.id} box={box} data={data} />
      ))}
      {!data.boxes.length && (
        <Txt>暂无猫砂盆，可在设置中重置以恢复默认猫砂盆。</Txt>
      )}
    </Page>
  );
}
