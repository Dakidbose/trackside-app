import * as Notifications from 'expo-notifications';

/** The picks card file named by the reminder the user last tapped, if any. */
export function useReminderTap(): string | undefined {
  const res = Notifications.useLastNotificationResponse();
  const file = res?.notification.request.content.data?.file;
  return typeof file === 'string' ? file : undefined;
}
