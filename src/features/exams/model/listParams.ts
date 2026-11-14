/**
 * Filters and sort live in the URL so a view can be bookmarked, shared or refreshed.
 * The URL is untrusted input (anyone can edit it): unknown keys are ignored, and
 * invalid values fall back to defaults instead of breaking the page.
 */
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  type ExamFilters,
  SORT_KEYS,
  type SortKey,
  type SortState,
} from './filters';
import { isExamStatus } from './status';

export interface ListParams {
  filters: ExamFilters;
  sort: SortState;
}

const PARAM: Record<keyof ExamFilters, string> = {
  query: 'q',
  status: 'status',
  country: 'country',
  candidateId: 'candidate',
  dateFrom: 'from',
  dateTo: 'to',
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const POSITIVE_INT = /^[1-9]\d{0,9}$/;

const isSortKey = (value: string | null): value is SortKey =>
  value !== null && (SORT_KEYS as readonly string[]).includes(value);

const text = (params: URLSearchParams, name: string) => (params.get(name) ?? '').slice(0, 100);

const matching = (params: URLSearchParams, name: string, pattern: RegExp) => {
  const value = params.get(name) ?? '';
  return pattern.test(value) ? value : '';
};

export function parseListParams(params: URLSearchParams): ListParams {
  const status = params.get(PARAM.status);
  const sortKey = params.get('sort');
  return {
    filters: {
      query: text(params, PARAM.query),
      status: isExamStatus(status) ? status : '',
      country: text(params, PARAM.country),
      candidateId: matching(params, PARAM.candidateId, POSITIVE_INT),
      dateFrom: matching(params, PARAM.dateFrom, ISO_DATE),
      dateTo: matching(params, PARAM.dateTo, ISO_DATE),
    },
    sort: isSortKey(sortKey)
      ? { key: sortKey, direction: params.get('dir') === 'desc' ? 'desc' : 'asc' }
      : DEFAULT_SORT,
  };
}

/** Writes only non-default values, so the default view has a clean URL. */
export function toListParams({ filters, sort }: ListParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAM) as (keyof ExamFilters)[]) {
    if (filters[key] !== EMPTY_FILTERS[key]) params.set(PARAM[key], filters[key]);
  }
  if (sort.key !== DEFAULT_SORT.key || sort.direction !== DEFAULT_SORT.direction) {
    params.set('sort', sort.key);
    params.set('dir', sort.direction);
  }
  return params;
}
