import { router } from 'expo-router';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorBox, Loading, PlayResponsibly, ScreenTitle } from '../../components/ui';
import { fetchArchiveRefs, SITE, type CardRef } from '../../lib/site';
import { useColors } from '../../lib/theme';
import { prettyDate } from '../../lib/time';
import { useAsync } from '../../lib/useAsync';

export default function ResultsScreen() {
  const c = useColors();
  const { data, error, loading, refreshing, refresh, reload } = useAsync(fetchArchiveRefs);

  const sections: { title: string; data: CardRef[] }[] = [];
  for (const r of data ?? []) {
    const last = sections[sections.length - 1];
    if (last && last.title === r.date) last.data.push(r);
    else sections.push({ title: r.date, data: [r] });
  }

  return (
    <SectionList
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior="automatic"
      sections={sections}
      keyExtractor={(r) => r.file}
      stickySectionHeadersEnabled={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.red} />}
      ListHeaderComponent={
        <View>
          <ScreenTitle title="Results" subtitle="Every card, graded against the official results" />
          <View style={{ gap: 8, marginBottom: 12 }}>
            <Button
              title="Full results ledger"
              onPress={() => router.push({ pathname: '/web', params: { url: `${SITE}/picks/results.html`, title: 'Results ledger' } })}
            />
          </View>
          {loading ? <Loading /> : null}
          {error ? <ErrorBox message={`Couldn't load past cards. ${error}`} onRetry={reload} /> : null}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={[styles.date, { color: c.muted }]}>{prettyDate(section.title)}</Text>
      )}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/card/[file]', params: { file: item.file } })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.6 }]}>
          <Text style={{ color: c.head, fontSize: 17, fontWeight: '600', flex: 1 }}>{item.track}</Text>
          <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
        </Pressable>
      )}
      ListFooterComponent={<PlayResponsibly />}
    />
  );
}

const styles = StyleSheet.create({
  date: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
    minHeight: 50,
  },
});
