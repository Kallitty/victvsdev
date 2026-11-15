import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCandidateSession } from '@/features/auth';
import { type Exam, examsQueryOptions, ExamTime, normaliseCountry, StatusBadge } from '@/features/exams';
import { getErrorMessage } from '@/shared/api/errors';

import { selectCandidateExams } from '../model/candidateExams';
import styles from './MyExamsPage.module.css';

/** A read-only card. It never shows other candidates' names: they aren't this user's data. */
function ExamCard({ exam }: { exam: Exam }) {
  return (
    <article className={styles.card} data-testid="candidate-exam">
      <div className={styles.cardTop}>
        <h4>{exam.title}</h4>
        <StatusBadge status={exam.status} />
      </div>
      <ExamTime exam={exam} />
      <p className={styles.muted}>
        {exam.location ? normaliseCountry(exam.location.country) : 'Venue to be confirmed'} · {exam.language}
      </p>
    </article>
  );
}

export function MyExamsPage() {
  const session = useCandidateSession();
  // `select` derives this candidate's exams from the shared cache; polling picks up
  // an invigilator's status change on exam day without a reload.
  const select = useCallback(
    (exams: Exam[]) => selectCandidateExams(exams, session.candidateId),
    [session.candidateId],
  );
  const { data, isPending, error, refetch } = useQuery({
    ...examsQueryOptions(),
    select,
    refetchInterval: 60_000,
  });

  return (
    <main id="main" className={styles.page}>
      <h2>Your exams, {session.candidateName}</h2>
      <p className={styles.muted}>Times are shown at each venue. This page updates automatically.</p>

      {isPending && <p role="status">Loading your exams...</p>}

      {!isPending && !data && (
        <div role="alert">
          <p>Couldn&apos;t load your exams. {getErrorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          <section aria-labelledby="upcoming-heading">
            <h3 id="upcoming-heading">Upcoming and in progress ({data.upcoming.length})</h3>
            {data.upcoming.length ? (
              <div className={styles.grid}>
                {data.upcoming.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            ) : (
              <p>You have no upcoming exams.</p>
            )}
          </section>
          <section aria-labelledby="completed-heading">
            <h3 id="completed-heading">Completed ({data.completed.length})</h3>
            {data.completed.length ? (
              <div className={styles.grid}>
                {data.completed.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            ) : (
              <p>No completed exams yet.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
