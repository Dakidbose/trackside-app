import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PlayResponsibly, ScreenTitle, SectionTitle } from '../../components/ui';
import { SITE } from '../../lib/site';
import { useColors } from '../../lib/theme';

const PAGES = [
  { path: '/about.html', title: 'About Trackside Selections' },
  { path: '/responsible-gambling.html', title: 'Responsible gambling' },
  { path: '/disclaimer.html', title: 'Disclaimer' },
  { path: '/privacy.html', title: 'Privacy policy' },
  { path: '/terms.html', title: 'Terms of use' },
  { path: '/contact.html', title: 'Contact us' },
];

export default function MoreScreen() {
  const c = useColors();
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Notifications.getAllScheduledNotificationsAsync()
        .then((n) => setCount(n.length))
        .catch(() => {});
    }, []),
  );

  const clearReminders = () =>
    Alert.alert('Cancel all reminders?', `This removes ${count} upcoming post time ${count === 1 ? 'reminder' : 'reminders'}.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel all',
        style: 'destructive',
        onPress: async () => {
          await Notifications.cancelAllScheduledNotificationsAsync();
          setCount(0);
        },
      },
    ]);

  const Row = ({ title, onPress, detail }: { title: string; onPress: () => void; detail?: string }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.6 }]}
    >
      <Text style={{ color: c.ink, fontSize: 16, flex: 1 }}>{title}</Text>
      {detail ? <Text style={{ color: c.muted, marginRight: 6 }}>{detail}</Text> : null}
      <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
    </Pressable>
  );

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 16 }} contentInsetAdjustmentBehavior="automatic">
      <ScreenTitle title="More" />

      <SectionTitle>Reminders</SectionTitle>
      <Row
        title="Post time reminders"
        detail={count ? `${count} set` : 'None set'}
        onPress={() =>
          count
            ? clearReminders()
            : Alert.alert('No reminders yet', 'Open a picks card and tap the bell on any upcoming race.')
        }
      />

      <SectionTitle>Help</SectionTitle>
      <Row title="Call or text 1-800-GAMBLER" onPress={() => Linking.openURL('tel:18004262537')} />

      <SectionTitle>Trackside Selections</SectionTitle>
      {PAGES.map((p) => (
        <Row key={p.path} title={p.title} onPress={() => router.push({ pathname: '/web', params: { url: `${SITE}${p.path}`, title: p.title } })} />
      ))}
      <Row title="Open tracksideselections.com" onPress={() => Linking.openURL(SITE)} />

      <View style={{ height: 8 }} />
      <PlayResponsibly />
      <Text style={{ color: c.muted, textAlign: 'center', fontSize: 12 }}>
        Version {Constants.expoConfig?.version ?? '1.0.0'} · Independent site, not affiliated with any racetrack, wagering operator or data
        provider.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 50,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
});
