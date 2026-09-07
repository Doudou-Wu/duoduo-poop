import { useData } from "../../components/DataProvider";
import { Page, Txt, Card, Heading } from "../../components/ui";
import { insights, rate, type RateRow } from "../../utils/stats";
function RateCard({ row }: { row: RateRow }) {
  return (
    <Card>
      <Txt>{row.key}</Txt>
      <Txt big>{rate(row.success, row.total)}</Txt>
      <Txt muted>
        {row.total ? `${row.success} / ${row.total} 次观察` : "数据还不够。"}
      </Txt>
    </Card>
  );
}
export default function Insights() {
  const stats = insights(useData());
  return (
    <Page>
      <Txt big>发现小规律</Txt>
      <Txt muted>根据全部日记记录统计。</Txt>
      <Heading>在猫砂盆内排泄的比例</Heading>
      <RateCard row={{ key: "便便", ...stats.poop }} />
      <RateCard row={{ key: "尿尿", ...stats.pee }} />
      <Heading>盆外排泄</Heading>
      <Card>
        {stats.outside.map((row) => (
          <Txt key={row.key}>
            {
              (
                { floor: "地板", bathtub: "浴缸", other: "其他" } as Record<
                  string,
                  string
                >
              )[row.key]
            }
            : {row.count}
          </Txt>
        ))}
      </Card>
      <Heading>各猫砂盆使用情况</Heading>
      {stats.usage.map((row) => (
        <Card key={row.box.id}>
          <Txt>
            {row.box.name}
            {row.box.active ? "" : " · 已停用"}
          </Txt>
          <Txt>
            尿尿：{row.pee} 次 · 便便：{row.poop} 次
          </Txt>
        </Card>
      ))}
      <Heading>不同猫砂产品的盆内便便比例</Heading>
      {stats.products.length ? (
        stats.products.map((row) => <RateCard key={row.key} row={row} />)
      ) : (
        <Txt muted>数据还不够。</Txt>
      )}
      <Heading>距离上次全部换砂的天数</Heading>
      {stats.ages.map((row) => (
        <RateCard key={row.key} row={row} />
      ))}
      <Card>
        <Txt>猫砂统计的计算方式</Txt>
        <Txt muted>
          盆内便便计入实际使用的猫砂盆。盆外便便会为当时有全部换砂记录的每个猫砂盆各计一次未在盆内排泄。因此，一次便便可能计入多个猫砂观察样本。
        </Txt>
        <Txt muted>
          以最近一次全部换砂时的产品为准。添加猫砂不会重置使用天数或更改产品标签，使用天数按完整的
          24 小时计算。
        </Txt>
        <Txt muted>
          发生时间未知或缺少换砂记录的事件不计入此处统计，但仍计入总体数量。已排除{" "}
          {stats.excluded} 次便便记录。
        </Txt>
        <Txt muted>
          第一阶段不记录猫砂盆的历史启停变化，有猫砂历史记录的盆仍会参与统计。这些规律仅描述观察结果，不能说明多多行为的原因。
        </Txt>
      </Card>
    </Page>
  );
}
