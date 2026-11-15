import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { useCandidatesQuery } from '@/features/exams';
import { getErrorMessage } from '@/shared/api/errors';

import { useAuth } from '../context/useAuth';
import { homePathFor, safeNextPath, type Session } from '../model/session';
import styles from './SignInPage.module.css';

/** Demo sign-in. No password field on purpose, and the banner says why. */
export function SignInPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidates = useCandidatesQuery();
  const [candidateId, setCandidateId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session && !submitting) return <Navigate to={homePathFor(session)} replace />;

  const finish = (signedIn: Session) => {
    void navigate(safeNextPath(searchParams.get('next'), signedIn), { replace: true });
  };

  const continueAsAdmin = async () => {
    setSubmitting(true);
    finish(await signIn({ role: 'admin' }));
  };

  const continueAsCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = candidates.data?.find((c) => String(c.id) === candidateId);
    if (!candidate) return;
    setSubmitting(true);
    finish(await signIn({ role: 'candidate', candidate }));
  };

  return (
    <main id="main" className={styles.page}>
      <h2>Sign in</h2>
      <p className={styles.banner} role="note">
        <strong>Demo mode.</strong> The exam API has no accounts, so there are no passwords here. In
        production, sign-in and permissions would be checked by the server.
      </p>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="staff-heading">
          <h3 id="staff-heading">VICTVS staff</h3>
          <p>Manage every session, filter the schedule and see venues on the map.</p>
          <button type="button" onClick={() => void continueAsAdmin()} disabled={submitting}>
            Continue as admin
          </button>
        </section>

        <section className={styles.card} aria-labelledby="candidate-heading">
          <h3 id="candidate-heading">Candidates</h3>
          <p>See your own exams and when and where they are.</p>
          {candidates.isError ? (
            <div role="alert">
              <p>Couldn&apos;t load the candidate list. {getErrorMessage(candidates.error)}</p>
              <button type="button" onClick={() => void candidates.refetch()}>
                Try again
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={(event) => void continueAsCandidate(event)}>
              <label htmlFor="candidate-select">Your name</label>
              <select
                id="candidate-select"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                disabled={candidates.isPending}
                required
              >
                <option value="">{candidates.isPending ? 'Loading candidates…' : 'Select your name'}</option>
                {candidates.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={!candidateId || submitting}>
                Continue as candidate
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
