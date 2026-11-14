import { normaliseCountry } from '../model/country';
import type { SortKey, SortState } from '../model/filters';
import type { Exam } from '../model/types';
import styles from './ExamTable.module.css';
import { ExamTime } from './ExamTime';
import { StatusBadge } from './StatusBadge';
import { StatusControl } from './StatusControl';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'status', label: 'Status' },
  { key: 'datetime', label: 'Date' },
  { key: 'country', label: 'Country' },
];

interface ExamTableProps {
  exams: Exam[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  pendingIds: ReadonlySet<number>;
  onAdvance: (exam: Exam) => void;
}

export function ExamTable({ exams, sort, onSort, pendingIds, onAdvance }: ExamTableProps) {
  const sortedBy = COLUMNS.find((c) => c.key === sort.key)?.label ?? '';

  return (
    <table className={styles.table}>
      <caption className={styles.caption}>
        Sorted by {sortedBy}, {sort.direction === 'asc' ? 'ascending' : 'descending'}. Select a column heading
        to change the order.
      </caption>
      <thead>
        <tr>
          {COLUMNS.map((column) => {
            const active = sort.key === column.key;
            return (
              <th
                key={column.key}
                scope="col"
                aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {/* The arrow is drawn by CSS from aria-sort, so the button text is exactly the label. */}
                <button type="button" className={styles.sortButton} onClick={() => onSort(column.key)}>
                  {column.label}
                </button>
              </th>
            );
          })}
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
