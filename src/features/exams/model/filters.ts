import { dateKeyInZone, parseExamInstant } from '@/shared/lib/datetime';

import { normaliseCountry } from './country';
import { EXAM_STATUSES, type Candidate, type Exam, type ExamStatus } from './types';
import { venueTimeZone } from './timeZone';

export interface ExamFilters {
  /** Free text matched against the exam title and candidate names. */
  query: string;
  status: ExamStatus | '';
  country: string;
  /** Candidate id as a string ('' = any), matching the <select> value. */
  candidateId: string;
  /** Inclusive dates (YYYY-MM-DD) or ''. */
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_FILTERS: ExamFilters = {
  query: '',
  status: '',
  country: '',
  candidateId: '',
  dateFrom: '',
  dateTo: '',
};

export const SORT_KEYS = ['title', 'candidates', 'status', 'datetime', 'country'] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortState = { key: 'datetime', direction: 'asc' };

export function hasActiveFilters(filters: ExamFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== '');
}

export function isDateRangeInvalid(filters: ExamFilters): boolean {
  return filters.dateFrom !== '' && filters.dateTo !== '' && filters.dateFrom > filters.dateTo;
}

/** Every filter narrows the list further (AND), unlike the starter's modal. */
export function filterExams(exams: readonly Exam[], filters: ExamFilters): Exam[] {
  const query = filters.query.trim().toLowerCase();

  return exams.filter((exam) => {
    if (filters.status && exam.status !== filters.status) return false;
    if (filters.country && normaliseCountry(exam.location?.country) !== filters.country) return false;
    if (filters.candidateId && !exam.candidates.some((c) => String(c.id) === filters.candidateId))
      return false;

    if (filters.dateFrom || filters.dateTo) {
      const epochMs = parseExamInstant(exam.datetime);
      if (epochMs === null) return false;
      // Compare the calendar date at the venue: the date shown next to the exam.
      const date = dateKeyInZone(epochMs, venueTimeZone(exam.location));
      if (filters.dateFrom && date < filters.dateFrom) return false;
      if (filters.dateTo && date > filters.dateTo) return false;
    }

    if (query) {
      const haystack = [exam.title, ...exam.candidates.map((c) => c.name)].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function compare(a: Exam, b: Exam, key: SortKey): number {
  switch (key) {
    case 'title':
      return a.title.localeCompare(b.title, 'en-GB', { sensitivity: 'base', numeric: true });
    case 'candidates':
      return a.candidates.length - b.candidates.length;
    case 'status':
      return EXAM_STATUSES.indexOf(a.status) - EXAM_STATUSES.indexOf(b.status);
    case 'country':
      return normaliseCountry(a.location?.country).localeCompare(
        normaliseCountry(b.location?.country),
        'en-GB',
      );
    case 'datetime':
      return (parseExamInstant(a.datetime) ?? Infinity) - (parseExamInstant(b.datetime) ?? Infinity);
  }
}

/** Returns a new array. Ties fall back to date, then id, so the order never jumps around. */
export function sortExams(exams: readonly Exam[], sort: SortState): Exam[] {
  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...exams].sort(
    (a, b) =>
      compare(a, b, sort.key) * direction ||
      (sort.key === 'datetime' ? 0 : compare(a, b, 'datetime')) ||
      a.id - b.id,
  );
}

/** Clicking the active column flips direction; a new column starts ascending. */
export function toggleSort(current: SortState, key: SortKey): SortState {
  if (current.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  return { key, direction: 'asc' };
}

export interface FilterOptions {
  countries: string[];
  candidates: Candidate[];
}

/** Dropdown options built from the loaded data, so they never list a country with no exams. */
export function getFilterOptions(exams: readonly Exam[]): FilterOptions {
  const countries = new Set<string>();
  const candidates = new Map<number, Candidate>();
  for (const exam of exams) {
    if (exam.location) countries.add(normaliseCountry(exam.location.country));
    for (const candidate of exam.candidates) candidates.set(candidate.id, candidate);
  }
  return {
    countries: [...countries].sort((a, b) => a.localeCompare(b, 'en-GB')),
    candidates: [...candidates.values()].sort((a, b) => a.name.localeCompare(b.name, 'en-GB')),
  };
}
