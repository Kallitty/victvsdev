import { useMemo } from 'react';

import { getErrorMessage } from '@/shared/api/errors';
import { parseExamInstant } from '@/shared/lib/datetime';

import { ExamTable } from '../components/ExamTable';
import { useAdvanceExamStatus } from '../hooks/useAdvanceExamStatus';
import { useExamsQuery } from '../hooks/useExamsQuery';
import type { Exam } from '../model/types';
import styles from './ExamList.module.css';

const NO_EXAMS: Exam[] = [];
const byDate = (a: Exam, b: Exam) =>
  (parseExamInstant(a.datetime) ?? Infinity) - (parseExamInstant(b.datetime) ?? Infinity);

/** Container: owns data and state; ExamTable just renders what it's given. */
export function ExamList() {
  const { data, isPending, isError, error, isFetching, refetch } = useExamsQuery();
  const { advance, pendingIds } = useAdvanceExamStatus();

  const exams = data ?? NO_EXAMS;
  const sorted = useMemo(() => [...exams].sort(byDate), [exams]);

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
          <div className={styles.toolbar}>
            <p aria-live="polite">{exams.length} sessions</p>
            <button type="button" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <ExamTable exams={sorted} pendingIds={pendingIds} onAdvance={advance} />
        </>
      )}
    </main>
  );
}
