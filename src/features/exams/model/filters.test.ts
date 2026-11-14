import { makeExam } from '@/test/fixtures';

import { EMPTY_FILTERS, filterExams, getFilterOptions, sortExams, toggleSort } from './filters';

const medical = makeExam({
  title: 'Medical Examinations 1',
  status: 'started',
  datetime: '2026-12-07 09:15:00',
});
const skydiving = makeExam({
  title: 'Skydiving License 1',
  datetime: '2026-04-14 12:00:00',
  location: { id: 3, country: 'Italy', latitude: 45.47, longitude: 9.11 },
  candidates: [{ id: 5, name: 'Donelly' }],
});
const annual = makeExam({
  title: 'VICTVS Annual Assessment',
  datetime: '2027-10-14 14:15:00',
  location: { id: 5, country: 'italy', latitude: 45.47, longitude: 9.11 },
  candidates: [{ id: 3, name: 'Jenner' }],
});
const exams = [medical, skydiving, annual];
const ids = (list: { id: number }[]) => list.map((e) => e.id);

describe('filterExams', () => {
  it('treats "Italy" and "italy" as one country', () => {
    expect(ids(filterExams(exams, { ...EMPTY_FILTERS, country: 'Italy' }))).toEqual([
      skydiving.id,
      annual.id,
    ]);
  });

  it('filters by candidate, status and an inclusive date range', () => {
    expect(ids(filterExams(exams, { ...EMPTY_FILTERS, candidateId: '5' }))).toEqual([skydiving.id]);
    expect(ids(filterExams(exams, { ...EMPTY_FILTERS, status: 'started' }))).toEqual([medical.id]);
    expect(
      ids(filterExams(exams, { ...EMPTY_FILTERS, dateFrom: '2026-04-14', dateTo: '2026-12-07' })),
    ).toEqual([medical.id, skydiving.id]);
  });

  it('combines filters (AND), and search matches titles and candidate names', () => {
    expect(
      ids(filterExams(exams, { ...EMPTY_FILTERS, country: 'Italy', status: 'pending', query: 'jenner' })),
    ).toEqual([annual.id]);
  });
});

describe('sorting', () => {
  it('sorts by date, soonest first, by default and flips on a second click', () => {
    expect(ids(sortExams(exams, { key: 'datetime', direction: 'asc' }))).toEqual([
      skydiving.id,
      medical.id,
      annual.id,
    ]);
    expect(toggleSort({ key: 'datetime', direction: 'asc' }, 'datetime')).toEqual({
      key: 'datetime',
      direction: 'desc',
    });
    expect(toggleSort({ key: 'datetime', direction: 'desc' }, 'title')).toEqual({
      key: 'title',
      direction: 'asc',
    });
  });
});

describe('getFilterOptions', () => {
  it('lists each country once, sorted', () => {
    expect(getFilterOptions(exams).countries).toEqual(['Italy', 'United Kingdom']);
  });
});
