import { makeExam } from '@/test/fixtures';

import { describeExamDay, pendingExamNote } from './countdown';

const berlin = { id: 2, country: 'Germany', latitude: 52.52, longitude: 13.405 };

describe('describeExamDay', () => {
  it('counts calendar days at the venue', () => {
    const exam = makeExam({ datetime: '2026-04-15 10:15:00', location: berlin });
    expect(describeExamDay(exam, new Date(Date.UTC(2026, 3, 14, 12)))?.text).toBe('Tomorrow');
    expect(describeExamDay(exam, new Date(Date.UTC(2026, 3, 15, 6)))?.text).toBe('Today');
  });

  it('switches to weeks and months further out', () => {
    const exam = makeExam({ datetime: '2026-04-15 10:15:00', location: berlin });
    expect(describeExamDay(exam, new Date(Date.UTC(2026, 2, 25)))?.text).toBe('In 3 weeks');
    expect(describeExamDay(exam, new Date(Date.UTC(2026, 0, 1)))?.text).toBe('In 3 months');
  });

  it('returns null for an unusable date', () => {
    expect(describeExamDay(makeExam({ datetime: 'not a date' }))).toBeNull();
  });
});

describe('pendingExamNote', () => {
  it('flags an overdue pending exam instead of saying it was in the past', () => {
    const exam = makeExam({ datetime: '2026-04-15 10:15:00', location: berlin });
    expect(pendingExamNote(exam, new Date(Date.UTC(2026, 3, 20)))).toBe('Was due 5 days ago');
  });
});
