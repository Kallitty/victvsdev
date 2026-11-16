import { type Exam, normaliseCountry, venueTimeZone } from '@/features/exams';
import { dateKeyInZone, parseExamInstant } from '@/shared/lib/datetime';

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** RFC 5545 line folding: lines of at most 75 bytes; continuation lines start with a space. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = '';
  for (const char of line) {
    const limit = chunks.length === 0 ? 75 : 74; // the leading space uses one byte
    if (encoder.encode(current + char).length > limit) {
      chunks.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  chunks.push(current);
  return chunks.join('\r\n ');
}

/** 2026-04-15T10:15:00.000Z -> 20260415T101500Z */
function utcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * A calendar file for one exam, or null if it has no usable date. DTSTART is the
 * exact UTC instant (trailing Z), so every calendar app shows it correctly in the
 * user's own time zone. The API gives no duration, so none is invented.
 */
export function buildExamIcs(exam: Exam, now: Date = new Date()): string | null {
  const epochMs = parseExamInstant(exam.datetime);
  if (epochMs === null) return null;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VICTVS//Exam Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:exam-${exam.id}@exam-scheduler.victvs`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(new Date(epochMs))}`,
    `SUMMARY:${escapeText(exam.title)}`,
    ...(exam.location
      ? [
          `LOCATION:${escapeText(normaliseCountry(exam.location.country))}`,
          `GEO:${exam.location.latitude};${exam.location.longitude}`,
        ]
      : []),
    `DESCRIPTION:${escapeText(`Language: ${exam.language}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/** e.g. "medical-examinations-1-2026-12-07.ics", using the date at the venue. */
export function icsFileName(exam: Exam): string {
  const slug = exam.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const epochMs = parseExamInstant(exam.datetime);
  const date = epochMs === null ? null : dateKeyInZone(epochMs, venueTimeZone(exam.location));
  return `${slug || 'exam'}${date ? `-${date}` : ''}.ics`;
}
