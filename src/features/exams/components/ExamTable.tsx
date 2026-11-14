import { normaliseCountry } from '../model/country';
import type { Exam } from '../model/types';
import styles from './ExamTable.module.css';
import { ExamTime } from './ExamTime';
import { StatusBadge } from './StatusBadge';
import { StatusControl } from './StatusControl';

interface ExamTableProps {
  exams: Exam[];
  pendingIds: ReadonlySet<number>;
  onAdvance: (exam: Exam) => void;
}

export function ExamTable({ exams, pendingIds, onAdvance }: ExamTableProps) {
  return (
    <table className={styles.table}>
      <caption className={styles.caption}>Exam sessions, soonest first</caption>
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Candidates</th>
          <th scope="col">Status</th>
          <th scope="col">Date</th>
          <th scope="col">Country</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {exams.map((exam) => (
          <tr key={exam.id} data-testid="exam-row">
            <td data-label="Title" className={styles.title}>
              {exam.title}
            </td>
            <td data-label="Candidates">{exam.candidates.map((c) => c.name).join(', ') || '—'}</td>
            <td data-label="Status">
              <StatusBadge status={exam.status} />
            </td>
            <td data-label="Date">
              <ExamTime exam={exam} />
            </td>
            <td data-label="Country">
              {exam.location ? normaliseCountry(exam.location.country) : 'Unknown'}
            </td>
            <td data-label="Action">
              <StatusControl exam={exam} isPending={pendingIds.has(exam.id)} onAdvance={onAdvance} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
