import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text } from 'react-native';
import { Card, ErrorBox, Loading, ScreenTitle, SectionTitle } from '../../components/ui';
import { fetchGuides, SITE } from '../../lib/site';
import { useColors } from '../../lib/theme';
import { useAsync } from '../../lib/useAsync';

const BASICS = [
  { path: '/betting-basics.html', title: 'Betting basics', blurb: 'Odds, bet types and budgeting, for first-time racing fans.' },
  { path: '/race-day.html', title: 'Race day schedule', blurb: "Today's tracks, entries and post times." },
];

export default function LearnScreen() {
  const c = useColors();
  const { data, error, loading, refreshing, refresh, reload } = useAsync(fetchGuides);
  const open = (path: string, title: string) => router.push({ pathname: '/web', params: { url: `${SITE}${path}`, title } });

  const item = (g: { path: string; title: string; blurb: string }) => (
    <Pressable key={g.path} onPress={() => open(g.path, g.title)} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      <Card>
        <Text style={{ color: c.head, fontSize: 17, fontWeight: '700' }}>{g.title}</Text>
        {g.blurb ? (
          <Text style={{ color: c.muted, marginTop: 4, fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
            {g.blurb}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.red} />}
    >
      <ScreenTitle title="Learn" subtitle="Handicapping guides from Trackside Selections" />
      <SectionTitle>Start here</SectionTitle>
      {BASICS.map(item)}
      <SectionTitle>Handicapping guides</SectionTitle>
      {loading ? <Loading /> : null}
      {error ? <ErrorBox message={`Couldn't load the guides. ${error}`} onRetry={reload} /> : null}
      {data?.map(item)}
    </ScrollView>
  );
}
