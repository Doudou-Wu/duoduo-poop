import { useData } from "../../components/DataProvider";
import { Page, Txt, Card, Heading } from "../../components/ui";
import { insights, rate, type RateRow } from "../../utils/stats";
function RateCard({ row }: { row: RateRow }) {
  return (
    <Card>
      <Txt>{row.key}</Txt>
      <Txt big>{rate(row.success, row.total)}</Txt>
      <Txt muted>
        {row.total
          ? `${row.success} / ${row.total} observations`
          : "Not enough data yet."}
      </Txt>
    </Card>
  );
}
export default function Insights() {
  const stats = insights(useData());
  return (
    <Page>
      <Txt big>Little patterns</Txt>
      <Txt muted>All-time observations from your journal.</Txt>
      <Heading>Litter-box success</Heading>
      <RateCard row={{ key: "Poop", ...stats.poop }} />
      <RateCard row={{ key: "Pee", ...stats.pee }} />
      <Heading>Outside the box</Heading>
      <Card>
        {stats.outside.map((row) => (
          <Txt key={row.key}>
            {row.key[0].toUpperCase() + row.key.slice(1)}: {row.count}
          </Txt>
        ))}
      </Card>
      <Heading>Usage per box</Heading>
      {stats.usage.map((row) => (
        <Card key={row.box.id}>
          <Txt>
            {row.box.name}
            {row.box.active ? "" : " · inactive"}
          </Txt>
          <Txt>
            Pee: {row.pee} · Poop: {row.poop}
          </Txt>
        </Card>
      ))}
      <Heading>Poop success by litter product</Heading>
      {stats.products.length ? (
        stats.products.map((row) => <RateCard key={row.key} row={row} />)
      ) : (
        <Txt muted>Not enough data yet.</Txt>
      )}
      <Heading>Days since full replacement</Heading>
      {stats.ages.map((row) => (
        <RateCard key={row.key} row={row} />
      ))}
      <Card>
        <Txt>How these litter insights work</Txt>
        <Txt muted>
          In-box poop counts for the box used. Outside poop counts as a failure
          for each box with a known full replacement at that time. A poop may
          therefore count in more than one litter observation.
        </Txt>
        <Txt muted>
          The latest full replacement sets the product. Additions do not reset
          its age or change its label. Age uses complete 24-hour periods.
        </Txt>
        <Txt muted>
          Unknown occurrence times and missing replacement history are excluded
          here, but included in overall counts. {stats.excluded} poop event(s)
          excluded.
        </Txt>
        <Txt muted>
          Historical activation changes are not recorded in Phase 1; boxes with
          recorded litter history remain eligible. These patterns describe
          observations, not the cause of Duoduo’s behavior.
        </Txt>
      </Card>
    </Page>
  );
}
