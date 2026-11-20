// Local notifications are iOS/Android only; the web preview never has a tapped reminder.
export function useReminderTap(): string | undefined {
  return undefined;
}
