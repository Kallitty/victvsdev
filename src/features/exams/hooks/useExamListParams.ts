import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EMPTY_FILTERS, type ExamFilters, type SortKey, toggleSort } from '../model/filters';
import { type ListParams, parseListParams, toListParams } from '../model/listParams';

/**
 * Filter and sort state for the sessions page, stored in the URL. It's local to this
 * page by design: nothing else needs it, so it doesn't belong in a global store.
 * `replace` stops every keystroke in the search box from adding a history entry.
 */
export function useExamListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, sort } = useMemo(() => parseListParams(searchParams), [searchParams]);

  const update = useCallback(
    (change: (current: ListParams) => ListParams) => {
      setSearchParams((previous) => toListParams(change(parseListParams(previous))), { replace: true });
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    (changes: Partial<ExamFilters>) => update((c) => ({ ...c, filters: { ...c.filters, ...changes } })),
    [update],
  );
  const resetFilters = useCallback(() => update((c) => ({ ...c, filters: EMPTY_FILTERS })), [update]);
  const changeSort = useCallback(
    (key: SortKey) => update((c) => ({ ...c, sort: toggleSort(c.sort, key) })),
    [update],
  );

  return { filters, sort, setFilters, resetFilters, changeSort };
}
