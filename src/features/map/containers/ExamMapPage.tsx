import { useMemo } from 'react';

import { type Exam, useExamsQuery } from '@/features/exams';
import { getErrorMessage } from '@/shared/api/errors';

import { ExamMapView } from '../components/ExamMapView';
import { VenueList } from '../components/VenueList';
import { groupExamsByLocation } from '../model/locations';
import styles from './ExamMapPage.module.css';

const NO_EXAMS: Exam[] = [];

/** Container: reads the shared exams cache, groups by venue, and picks which state to show. */
export function ExamMapPage() {
  const { data, isPending, isError, error, refetch } = useExamsQuery();
  const groups = useMemo(() => groupExamsByLocation(data ?? NO_EXAMS), [data]);

  return (
    <main id="main" className={styles.page}>
      <h2>Exam Sessions Map</h2>
      <p className={styles.intro}>Each marker is a venue. Select one to see the sessions held there.</p>

      {isPending && <p role="status">Loading sessions...</p>}

      {isError && !data && (
        <div role="alert">
          <p>Couldn&apos;t load exam locations. {getErrorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      )}

      {data && groups.length === 0 && <p>No sessions with a location to display...</p>}

      {groups.length > 0 && (
        <>
          <ExamMapView groups={groups} />
          <VenueList groups={groups} />
        </>
      )}
    </main>
  );
}
