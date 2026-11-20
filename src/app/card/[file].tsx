import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, RefreshControl, ScrollView, Share, Text } from 'react-native';
import { RaceTile } from '../../components/RaceTile';
import { Card, ErrorBox, Loading, PlayResponsibly } from '../../components/ui';
import { cancelRaceReminder, LEAD_MINUTES, reminderId, scheduledIds, scheduleRaceReminder } from '../../lib/reminders';
import { fetchCard, SITE, type Race } from '../../lib/site';
import { useColors } from '../../lib/theme';
import { postTimeToDate, prettyDate } from '../../lib/time';
import { useAsync } from '../../lib/useAsync';

export default function CardScreen() {
  const { file } = useLocalSearchParams<{ file: string }>();
  const c = useColors();
  const { data: card, error, loading, refreshing, refresh, reload } = useAsync(() => fetchCard(file), [file]);
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  const syncReminders = useCallback(() => {
    scheduledIds().then(setReminders).catch(() => {});
  }, []);
  useEffect(syncReminders, [syncReminders]);

  const toggle = async (race: Race) => {
    if (!card) return;
    const id = reminderId(card.file, race.number);
    if (reminders.has(id)) {
      await cancelRaceReminder(card.file, race.number);
      return syncReminders();
    }
    const post = postTimeToDate(card.date, race.postTime);
    if (!post) return;
    const top = race.selections[0];
    const result = await scheduleRaceReminder({
      file: card.file,
      track: card.track,
      race: race.number,
      post,
      topPick: top ? `#${top.program}${top.horse ? ` ${top.horse}` : ''}` : undefined,
    });
    if (result === 'denied') {
      Alert.alert('Notifications are off', 'Turn on notifications for Trackside in Settings to get post time reminders.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    } else if (result === 'too-late') {
      Alert.alert('Too close to post', `Reminders go off ${LEAD_MINUTES} minutes before post time.`);
    }
    syncReminders();
  };

  const share = () => {
    if (!card) return;
    Share.share({ message: `${card.track} picks for ${prettyDate(card.date)}: ${SITE}/picks/${card.file.replace(/\.html$/, '')}` });
  };

  const now = Date.now();
  return (
    <>
      <Stack.Screen
        options={{
          title: card?.track ?? 'Picks',
          headerRight: () => (
            <Text onPress={share} style={{ color: c.red, fontSize: 16, fontWeight: '600' }} accessibilityRole="button">
              Share
            </Text>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16 }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.red} />}
      >
        {loading ? <Loading /> : null}
        {error ? <ErrorBox message={`Couldn't load this card. ${error}`} onRetry={reload} /> : null}
        {card ? (
          <>
            <Text style={{ color: c.head, fontSize: 22, fontWeight: '800' }}>{card.heading}</Text>
            {card.summary ? (
              <Card style={{ marginTop: 12 }} accent={c.red}>
                <Text style={{ color: c.ink, fontWeight: '600', lineHeight: 20 }}>{card.summary}</Text>
              </Card>
            ) : null}
            {card.meta.map((m, i) => (
              <Text key={i} style={{ color: c.muted, fontSize: 13, lineHeight: 19, marginTop: i ? 4 : 12 }}>
                {m}
              </Text>
            ))}
            <Text style={{ color: c.muted, fontSize: 13, marginTop: 4, marginBottom: 12 }}>
              Tap the bell on a race to get a reminder {LEAD_MINUTES} minutes before post.
            </Text>
            {card.races.map((race) => {
              const post = postTimeToDate(card.date, race.postTime);
              const upcoming = !race.official && !!post && post.getTime() - LEAD_MINUTES * 60_000 > now;
              return (
                <RaceTile
                  key={race.number}
                  race={race}
                  canRemind={upcoming}
                  reminderOn={reminders.has(reminderId(card.file, race.number))}
                  onToggleReminder={() => toggle(race)}
                />
              );
            })}
          </>
        ) : null}
        <PlayResponsibly />
      </ScrollView>
    </>
  );
}
