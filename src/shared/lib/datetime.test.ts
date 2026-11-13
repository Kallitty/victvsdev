import { formatExamDateTime, parseExamInstant, toDateTimeAttribute } from './datetime';

describe('parseExamInstant', () => {
  it('reads the API format as UTC', () => {
    expect(parseExamInstant('2026-12-07 09:15:00')).toBe(Date.UTC(2026, 11, 7, 9, 15, 0));
  });

  it('rejects impossible dates instead of rolling them over', () => {
    expect(parseExamInstant('2026-02-31 09:00:00')).toBeNull();
    expect(parseExamInstant('next Tuesday')).toBeNull();
  });
});

describe('formatExamDateTime', () => {
  it('converts to the venue zone, including summer time', () => {
    expect(formatExamDateTime('2026-12-07 09:15:00', 'Europe/London')).toBe('Mon 7 Dec 2026, 09:15 GMT');
    expect(formatExamDateTime('2026-04-15 10:15:00', 'Europe/London')).toBe('Wed 15 Apr 2026, 11:15 BST');
    expect(formatExamDateTime('2026-04-15 10:15:00', 'Europe/Berlin')).toBe('Wed 15 Apr 2026, 12:15 CEST');
  });

  it('returns unreadable values unchanged', () => {
    expect(formatExamDateTime('TBC')).toBe('TBC');
  });
});

describe('toDateTimeAttribute', () => {
  it('gives the exact UTC instant', () => {
    expect(toDateTimeAttribute('2026-12-07 09:15:00')).toBe('2026-12-07T09:15:00.000Z');
  });
});
