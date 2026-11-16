import { Link, useParams } from 'react-router-dom';

import { useCandidateSession } from '@/features/auth';
import { ExamTime, normaliseCountry, StatusBadge } from '@/features/exams';
import { getErrorMessage } from '@/shared/api/errors';

import { AddToCalendarButton } from '../components/AddToCalendarButton';
import { Countdown } from '../components/Countdown';
import { useCandidateExams } from '../hooks/useCandidateExams';
import { describeExamDay, pendingExamNote } from '../model/countdown';
import styles from './CandidateExamPage.module.css';

const STATUS_MESSAGES = {
  pending: 'Not started yet.',
  started: 'In progress now.',
  finished: 'This exam has finished.',
} as const;

export function CandidateExamPage() {
  const session = useCandidateSession();
  const { examId } = useParams();
  const { data, isPending, error, refetch } = useCandidateExams(session.candidateId);

  const backLink = (
    <Link className={styles.back} to="/me">
      ← All my exams
    </Link>
  );

  if (isPending) {
    return (
      <main id="main" className={styles.page}>
        <p role="status">Loading your exam...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main" className={styles.page}>
        <div role="alert">
          <p>Couldn&apos;t load this exam. {getErrorMessage(error)}</p>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  // Only this candidate's exams are searched, so another person's exam id looks
  // exactly like one that doesn't exist: nothing about it is revealed.
  const exam = [...data.upcoming, ...data.completed].find((e) => String(e.id) === examId);

  if (!exam) {
    return (
      <main id="main" className={styles.page}>
        <h2>Exam not found</h2>
        <p>We couldn&apos;t find that exam among your bookings.</p>
        {backLink}
      </main>
    );
  }

  const when = exam.status === 'pending' ? pendingExamNote(exam) : null;
  const isOverdue = exam.status === 'pending' && (describeExamDay(exam)?.isPast ?? false);

  return (
    <main id="main" className={styles.page}>
      {backLink}
      <h2>{exam.title}</h2>

      <dl className={styles.details}>
        <div>
          <dt>Status</dt>
          <dd className={styles.inline}>
            <StatusBadge status={exam.status} />
            <span>{STATUS_MESSAGES[exam.status]}</span>
          </dd>
        </div>
        <div>
          <dt>When (at the venue)</dt>
          <dd>
            <ExamTime exam={exam} />
            {when ? <Countdown text={when} large /> : null}
          </dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{exam.location ? normaliseCountry(exam.location.country) : 'Venue to be confirmed'}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{exam.language}</dd>
        </div>
      </dl>

      {isOverdue ? (
        <p className={styles.notice} role="note">
          This exam&apos;s scheduled date has passed but it hasn&apos;t started. Please contact VICTVS if you
          have questions about it.
        </p>
      ) : null}

      <AddToCalendarButton exam={exam} />
    </main>
  );
}
