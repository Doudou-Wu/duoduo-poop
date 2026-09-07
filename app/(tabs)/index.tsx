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
      <Txt big>多多便便 🐱</Txt>
      <Txt muted>每天多一点关爱。</Txt>
      <Card>
        <Txt muted>今天</Txt>
        <View style={{ ...s.row, justifyContent: "space-between" }}>
          {[
            { label: "尿尿", value: summary.pee },
            { label: "便便", value: summary.poop },
            { label: "盆外", value: summary.outside },
          ].map((x) => (
            <View key={x.label}>
              <Txt big>{x.value}</Txt>
              <Txt muted>{x.label}</Txt>
            </View>
          ))}
        </View>
      </Card>
      <Heading>记录一下</Heading>
      <View style={s.wrap}>
        <QuickEventButton
          title="尿尿"
          icon="💧"
          onPress={() => router.push("/record?type=pee")}
        />
        <QuickEventButton
          title="便便"
          icon="💩"
          onPress={() => router.push("/record?type=poop")}
        />
        <QuickEventButton
          title="清洁"
          icon="🧹"
          onPress={() =>
            Alert.alert("清洁猫砂盆", "进行了什么操作？", [
              {
                text: "铲砂",
                onPress: () => router.push("/record?type=scoop"),
              },
              {
                text: "清洗猫砂盆",
                onPress: () => router.push("/record?type=wash_box"),
              },
              { text: "取消", style: "cancel" },
            ])
          }
        />
        <QuickEventButton
          title="猫砂"
          icon="➕"
          onPress={() =>
            Alert.alert("猫砂维护", "进行了什么操作？", [
              {
                text: "添加猫砂",
                onPress: () => router.push("/record?type=add_litter"),
              },
              {
                text: "全部换砂",
                onPress: () => router.push("/record?type=replace_litter"),
              },
              { text: "取消", style: "cancel" },
            ])
          }
        />
      </View>
      <Heading>最近记录</Heading>
      {data.events.slice(0, 10).map((event) => (
        <EventCard key={event.id} event={event} boxes={data.boxes} />
      ))}
      {!data.events.length && (
        <Card>
          <Txt>从这里开始记录。</Txt>
          <Txt muted>点击尿尿或便便，选择位置后保存。</Txt>
        </Card>
      )}
      <Button title="设置" onPress={() => router.push("/settings")} />
    </Page>
  );
}
