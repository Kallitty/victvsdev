import { formatExamDateTime, toDateTimeAttribute } from '@/shared/lib/datetime';

import { venueTimeZone } from '../model/timeZone';
import type { Exam } from '../model/types';

/** Venue time ("12:15 CEST"); hover for the viewer's own time when it differs. */
export function ExamTime({ exam }: { exam: Pick<Exam, 'datetime' | 'location'> }) {
  const venueText = formatExamDateTime(exam.datetime, venueTimeZone(exam.location));
  const viewerText = formatExamDateTime(exam.datetime, Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <time
      dateTime={toDateTimeAttribute(exam.datetime)}
      title={viewerText !== venueText ? `Your time: ${viewerText}` : undefined}
    >
      {venueText}
    </time>
  );
}
