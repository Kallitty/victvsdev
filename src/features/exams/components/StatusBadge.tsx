import { STATUS_LABELS } from '../model/status';
import type { ExamStatus } from '../model/types';
import styles from './StatusBadge.module.css';

export function StatusBadge({ status }: { status: ExamStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`} data-status={status}>
      {STATUS_LABELS[status]}
    </span>
  );
}
