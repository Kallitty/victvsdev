import { toast } from 'react-hot-toast';

import type { Exam } from '@/features/exams';

import { buildExamIcs, icsFileName } from '../model/ics';

/** Downloads an .ics file. It's built in the browser, so nothing is sent anywhere. */
export function AddToCalendarButton({ exam }: { exam: Exam }) {
  const ics = buildExamIcs(exam);

  const download = () => {
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = icsFileName(exam);
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded.');
  };

  return (
    <button type="button" onClick={download} disabled={!ics}>
      Add to calendar
    </button>
  );
}
