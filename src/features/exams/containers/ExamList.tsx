import { useMemo } from 'react';

import { getErrorMessage } from '@/shared/api/errors';

import { ExamFilterBar } from '../components/ExamFilterBar';
import { ExamTable } from '../components/ExamTable';
import { useAdvanceExamStatus } from '../hooks/useAdvanceExamStatus';
import { useExamListParams } from '../hooks/useExamListParams';
import { useExamsQuery } from '../hooks/useExamsQuery';
import { filterExams, getFilterOptions, sortExams } from '../model/filters';
import type { Exam } from '../model/types';
import styles from './ExamList.module.css';

const NO_EXAMS: Exam[] = [];

/** Container: server data from React Query, filters and sort from the URL. */
export function ExamList() {
  const { data, isPending, isError, error, isFetching, refetch } = useExamsQuery();
  const { advance, pendingIds } = useAdvanceExamStatus();
  const { filters, sort, setFilters, resetFilters, changeSort } = useExamListParams();

  const exams = data ?? NO_EXAMS;
  const options = useMemo(() => getFilterOptions(exams), [exams]);
  const visible = useMemo(() => sortExams(filterExams(exams, filters), sort), [exams, filters, sort]);

  return (
    <main id="main" className={styles.page}>
      <h2>Upcoming Sessions</h2>
      <p className={styles.intro}>
        Times are shown at each venue, with the time zone. Hover a time to see yours.
      </p>

      {isPending && <p role="status">Loading sessions...</p>}

      {isError && !data && (
        <div role="alert" className={styles.error}>
          <p>Couldn&apos;t load exam sessions. {getErrorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      )}

      {!isPending && exams.length === 0 && <p>No sessions to display...</p>}

      {exams.length > 0 && (
        <>
          <ExamFilterBar filters={filters} options={options} onChange={setFilters} onReset={resetFilters} />

          <div className={styles.toolbar}>
            <p aria-live="polite">
              Showing {visible.length} of {exams.length} sessions
            </p>
            <button type="button" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {visible.length > 0 ? (
            <ExamTable
              exams={visible}
              sort={sort}
              onSort={changeSort}
              pendingIds={pendingIds}
              onAdvance={advance}
            />
          ) : (
            <div className={styles.noMatch}>
              <p>No sessions match these filters.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
