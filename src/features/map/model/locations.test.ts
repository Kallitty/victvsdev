import { makeExam } from '@/test/fixtures';

import { groupExamsByLocation } from './locations';

const italy = { id: 3, country: 'Italy', latitude: 45.478482, longitude: 9.116238 };
const italyLowercase = { id: 5, country: 'italy', latitude: 45.478482, longitude: 9.116238 };
const uk = { id: 1, country: 'United Kingdom', latitude: 51.507351, longitude: -0.127758 };

describe('groupExamsByLocation', () => {
  const exams = [
    makeExam({ id: 4, location: italy, status: 'pending' }),
    makeExam({ id: 9, location: italyLowercase, status: 'pending' }),
    makeExam({ id: 1, location: uk, status: 'started' }),
    makeExam({ id: 2, location: null }),
  ];
  const groups = groupExamsByLocation(exams);

  it('merges separate location records at the same coordinates into one marker', () => {
    expect(groups.map((g) => g.label)).toEqual(['Italy', 'United Kingdom']);
    expect(groups[0]?.exams.map((e) => e.id)).toEqual([4, 9]);
  });

  it('counts sessions per status and skips exams with no location', () => {
    expect(groups[0]?.statusCounts).toEqual({ pending: 2, started: 0, finished: 0 });
    expect(groups.flatMap((g) => g.exams)).toHaveLength(3);
  });
});
