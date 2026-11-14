import { useState } from 'react';

import { nextStatus } from '../model/status';
import type { Exam } from '../model/types';
import styles from './StatusControl.module.css';

const ACTION_LABEL = { pending: 'Start', started: 'Finish' } as const;

interface StatusControlProps {
  exam: Exam;
  isPending: boolean;
  onAdvance: (exam: Exam) => void;
}

/** Finishing is final (the lifecycle is one-way), so it asks for confirmation first. */
export function StatusControl({ exam, isPending, onAdvance }: StatusControlProps) {
  const [confirming, setConfirming] = useState(false);
  const target = nextStatus(exam.status);

  if (!target || exam.status === 'finished') return <span className={styles.muted}>Complete</span>;
  const action = ACTION_LABEL[exam.status];

  if (confirming) {
    return (
      <div className={styles.group} role="group" aria-label={`Confirm finishing ${exam.title}`}>
        <button
          type="button"
          className={`${styles.button} ${styles.danger}`}
          onClick={() => {
            setConfirming(false);
            onAdvance(exam);
          }}
        >
          Confirm finish
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.ghost}`}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.button}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={isPending ? `Saving ${exam.title}` : `${action} ${exam.title}`}
      onClick={() => {
        if (target === 'finished') setConfirming(true);
        else onAdvance(exam);
      }}
    >
      {isPending ? 'Saving…' : action}
    </button>
  );
}
