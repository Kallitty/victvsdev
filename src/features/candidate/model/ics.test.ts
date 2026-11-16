import { makeExam } from '@/test/fixtures';

import { buildExamIcs, icsFileName } from './ics';

const now = new Date(Date.UTC(2026, 10, 12, 15, 30));
const berlin = { id: 2, country: 'Germany', latitude: 52.52, longitude: 13.405 };

describe('buildExamIcs', () => {
  it('uses the exact UTC instant and CRLF line endings', () => {
    const ics =
      buildExamIcs(makeExam({ id: 3, datetime: '2026-04-15 10:15:00', location: berlin }), now) ?? '';
    expect(ics).toContain('DTSTART:20260415T101500Z\r\n');
    expect(ics).toContain('UID:exam-3@exam-scheduler.victvs');
    expect(ics).toContain('LOCATION:Germany');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('escapes characters that are special in calendar files', () => {
    const ics = buildExamIcs(makeExam({ title: 'Wood, Level 2; Part A' }), now) ?? '';
    expect(ics).toContain('SUMMARY:Wood\\, Level 2\\; Part A');
  });

  it('returns null when the exam has no usable date', () => {
    expect(buildExamIcs(makeExam({ datetime: 'not a date' }), now)).toBeNull();
  });
});

describe('icsFileName', () => {
  it('uses a safe slug and the date at the venue', () => {
    expect(
      icsFileName(makeExam({ title: 'Medical Examinations 1!', datetime: '2026-12-07 09:15:00' })),
    ).toMatch(/^medical-examinations-1-2026-12-07\.ics$/);
  });
});
