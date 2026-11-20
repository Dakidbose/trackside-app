import { Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, ErrorBox, Loading, PlayResponsibly, ProgramNumber, ScreenTitle, SectionTitle } from '../../components/ui';
import { fetchCard, fetchTodayRefs, type Card as PicksCard } from '../../lib/site';
import { useColors } from '../../lib/theme';
import { prettyDate } from '../../lib/time';
import { useAsync } from '../../lib/useAsync';

async function loadToday(): Promise<PicksCard[]> {
  const refs = await fetchTodayRefs();
  return Promise.all(refs.map((r) => fetchCard(r.file)));
}

export default function PicksScreen() {
  const c = useColors();
  const { data, error, loading, refreshing, refresh, reload } = useAsync(loadToday);

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.red} />}
    >
      <ScreenTitle title="Today's Picks" subtitle="Free race-by-race selections" />
      {loading ? <Loading /> : null}
      {error ? <ErrorBox message={`Couldn't load today's picks. ${error}`} onRetry={reload} /> : null}
      {data && data.length === 0 ? (
        <Card>
          <Text style={{ color: c.ink }}>No cards are posted yet today. Pull down to refresh, or check Results for past cards.</Text>
        </Card>
      ) : null}

      {data?.map((card) => {
        const graded = card.races.filter((r) => r.official).length;
        return (
          <View key={card.file} style={{ marginBottom: 8 }}>
            <Link href={{ pathname: '/card/[file]', params: { file: card.file } }} asChild>
              <Pressable>
                <Card accent={c.red}>
                  <Text style={[styles.track, { color: c.head }]}>{card.track}</Text>
                  <Text style={{ color: c.muted, marginTop: 2 }}>
                    {prettyDate(card.date)} · {card.races.length} races
                    {graded ? ` · ${graded} official` : ''}
                  </Text>
                  {card.summary ? <Text style={[styles.summary, { color: c.ink }]}>{card.summary}</Text> : null}
                  <Text style={{ color: c.link, fontWeight: '700', marginTop: 10 }}>See all races ›</Text>
                </Card>
              </Pressable>
            </Link>

            {card.strongest.length ? <SectionTitle>Strongest plays · {card.track}</SectionTitle> : null}
            {card.strongest.map((p, i) => (
              <Card key={i}>
                <View style={styles.row}>
                  <Text style={{ color: c.head, fontWeight: '800', flex: 1 }}>
                    Race {p.race}
                    {p.postTime ? <Text style={{ color: c.muted, fontWeight: '400' }}> · {p.postTime}</Text> : null}
                  </Text>
                  <Badge kind={p.label === 'Best bet' ? 'cash' : 'pend'} label={p.label} />
                </View>
                {p.selection ? (
                  <View style={[styles.row, { marginTop: 8 }]}>
                    <ProgramNumber n={p.selection.program} top />
                    <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600', flex: 1 }}>{p.selection.horse}</Text>
                    {p.selection.ml ? <Text style={{ color: c.muted }}>ML {p.selection.ml}</Text> : null}
                  </View>
                ) : null}
                {p.reason ? <Text style={{ color: c.muted, marginTop: 8, fontSize: 14 }}>{p.reason}</Text> : null}
                {p.result ? <Text style={{ color: c.ink, marginTop: 6, fontWeight: '700', fontSize: 14 }}>{p.result}</Text> : null}
              </Card>
            ))}
          </View>
        );
      })}
      <PlayResponsibly />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  track: { fontSize: 22, fontWeight: '800' },
  summary: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
