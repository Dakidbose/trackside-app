// Post times on the site look like "4:00 PM PT". Cards are dated YYYY-MM-DD in the track's local
// calendar, so we combine the two into an absolute Date without relying on Intl time zone data.

const ZONES: Record<string, number> = { ET: -5, CT: -6, MT: -7, PT: -8 }; // standard-time UTC offsets

/** n-th Sunday (1-based) of a month, as a day-of-month number. */
function nthSunday(year: number, month0: number, n: number): number {
  const first = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  return 1 + ((7 - first) % 7) + (n - 1) * 7;
}

/** US daylight time: second Sunday in March to first Sunday in November (local 2 AM). */
function isUsDst(year: number, month0: number, day: number, hour: number): boolean {
  if (month0 < 2 || month0 > 10) return false;
  if (month0 > 2 && month0 < 10) return true;
  if (month0 === 2) {
    const start = nthSunday(year, 2, 2);
    return day > start || (day === start && hour >= 2);
  }
  const end = nthSunday(year, 10, 1);
  return day < end || (day === end && hour < 2);
}

export function postTimeToDate(date: string, postTime: string | undefined): Date | null {
  if (!postTime) return null;
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = postTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*([ECMP]T)?/i);
  if (!d || !t) return null;
  const [year, month0, day] = [Number(d[1]), Number(d[2]) - 1, Number(d[3])];
  let hour = Number(t[1]) % 12;
  if (t[3].toUpperCase() === 'PM') hour += 12;
  const minute = Number(t[2]);
  const zone = (t[4] ?? 'PT').toUpperCase();
  const offset = (ZONES[zone] ?? -8) + (isUsDst(year, month0, day, hour) ? 1 : 0);
  return new Date(Date.UTC(year, month0, day, hour - offset, minute));
}

export function prettyDate(date: string): string {
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!d) return date;
  const dt = new Date(Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), 12));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[dt.getUTCDay()]}, ${months[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
}
