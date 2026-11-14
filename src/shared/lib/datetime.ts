const EXAM_DATETIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?Z?$/;

/** Milliseconds since the epoch, or null if the value isn't a real date and time. */
export function parseExamInstant(value: string): number | null {
  const match = EXAM_DATETIME.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute, second = '00'] = match;
  const epochMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  const check = new Date(epochMs);
  if (
    check.getUTCFullYear() !== Number(year) ||
    check.getUTCMonth() !== Number(month) - 1 ||
    check.getUTCDate() !== Number(day) ||
    Number(hour) > 23 ||
    Number(minute) > 59
  ) {
    return null;
  }
  return epochMs;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
      timeZoneName: 'short',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

export function formatExamDateTime(value: string, timeZone = 'UTC'): string {
  const epochMs = parseExamInstant(value);
  if (epochMs === null) return value;
  const parts = formatterFor(timeZone).formatToParts(epochMs);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${pick('weekday')} ${pick('day')} ${pick('month')} ${pick('year')}, ${pick('hour')}:${pick('minute')} ${pick('timeZoneName')}`;
}

/** For <time dateTime="...">: the exact instant in ISO 8601. */
export function toDateTimeAttribute(value: string): string | undefined {
  const epochMs = parseExamInstant(value);
  return epochMs === null ? undefined : new Date(epochMs).toISOString();
}
