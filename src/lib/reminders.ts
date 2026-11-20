// Local "post time" reminders. Scheduled on the phone, so no push server is needed.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const LEAD_MINUTES = 10;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function reminderId(file: string, race: number): string {
  return `${file.replace(/\.html$/, '')}-r${race}`;
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function scheduledIds(): Promise<Set<string>> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return new Set(all.map((n) => n.identifier));
}

export type ScheduleResult = 'scheduled' | 'denied' | 'too-late';

export async function scheduleRaceReminder(opts: {
  file: string;
  track: string;
  race: number;
  post: Date;
  topPick?: string;
}): Promise<ScheduleResult> {
  const fireAt = new Date(opts.post.getTime() - LEAD_MINUTES * 60_000);
  if (fireAt.getTime() <= Date.now() + 5_000) return 'too-late';
  if (!(await ensurePermission())) return 'denied';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('post-time', {
      name: 'Post time reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  await Notifications.scheduleNotificationAsync({
    identifier: reminderId(opts.file, opts.race),
    content: {
      title: `${opts.track} Race ${opts.race} in ${LEAD_MINUTES} minutes`,
      body: opts.topPick ? `Top pick: ${opts.topPick}. Tap for the full card.` : 'Tap for the full card.',
      data: { file: opts.file },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt, channelId: 'post-time' },
  });
  return 'scheduled';
}

export async function cancelRaceReminder(file: string, race: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId(file, race));
}
