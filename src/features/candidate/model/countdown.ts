import { type Exam, venueTimeZone } from '@/features/exams';
import { dateKeyInZone, parseExamInstant } from '@/shared/lib/datetime';

const DAY_MS = 24 * 60 * 60 * 1000;
const relative = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type ExamWhen = Pick<Exam, 'datetime' | 'location'>;

export interface ExamDay {
  /** "Today", "Tomorrow", "In 5 days", "In 3 weeks", "2 months ago"... */
  text: string;
  /** True once the exam's start time has passed. */
  isPast: boolean;
}

/**
 * When an exam is, relative to now. "Today" and "Tomorrow" are calendar days at the
 * venue, because that's where the candidate will be. Whether it has passed is
 * decided by the exact instant.
 */
export function describeExamDay(exam: ExamWhen, now: Date = new Date()): ExamDay | null {
  const epochMs = parseExamInstant(exam.datetime);
  if (epochMs === null) return null;

  const zone = venueTimeZone(exam.location);
  const examDay = Date.parse(`${dateKeyInZone(epochMs, zone)}T00:00:00Z`);
  const today = Date.parse(`${dateKeyInZone(now.getTime(), zone)}T00:00:00Z`);
  const days = Math.round((examDay - today) / DAY_MS);

  const abs = Math.abs(days);
  const text =
    abs < 14
      ? relative.format(days, 'day')
      : abs < 60
        ? relative.format(Math.round(days / 7), 'week')
        : relative.format(Math.round(days / 30), 'month');

  return { text: capitalise(text), isPast: epochMs < now.getTime() };
}

/** For a pending exam. An overdue one says "Was due…" so it doesn't read as "you missed it". */
export function pendingExamNote(exam: ExamWhen, now: Date = new Date()): string | null {
  const day = describeExamDay(exam, now);
  if (!day) return null;
  return day.isPast ? `Was due ${day.text.toLowerCase()}` : day.text;
}
