import { type ExamFilters, type FilterOptions, hasActiveFilters, isDateRangeInvalid } from '../model/filters';
import { isExamStatus, STATUS_LABELS } from '../model/status';
import { EXAM_STATUSES } from '../model/types';
import styles from './ExamFilterBar.module.css';

interface ExamFilterBarProps {
  filters: ExamFilters;
  options: FilterOptions;
  onChange: (changes: Partial<ExamFilters>) => void;
  onReset: () => void;
}

/** Filters apply as you type or choose. Each one combines with the others. */
export function ExamFilterBar({ filters, options, onChange, onReset }: ExamFilterBarProps) {
  const rangeInvalid = isDateRangeInvalid(filters);

  return (
    <form
      className={styles.bar}
      role="search"
      aria-label="Filter exam sessions"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={`${styles.field} ${styles.wide}`}>
        <label htmlFor="filter-query">Search</label>
        <input
          id="filter-query"
          type="search"
          placeholder="Exam title or candidate"
          autoComplete="off"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="filter-status">Filter by status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onChange({ status: isExamStatus(e.target.value) ? e.target.value : '' })}
        >
          <option value="">All statuses</option>
          {EXAM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="filter-country">Filter by country</label>
        <select
          id="filter-country"
          value={filters.country}
          onChange={(e) => onChange({ country: e.target.value })}
        >
          <option value="">All countries</option>
          {options.countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="filter-candidate">Filter by candidate</label>
        <select
          id="filter-candidate"
          value={filters.candidateId}
          onChange={(e) => onChange({ candidateId: e.target.value })}
        >
          <option value="">All candidates</option>
          {options.candidates.map((candidate) => (
            <option key={candidate.id} value={String(candidate.id)}>
              {candidate.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="filter-from">From date</label>
        <input
          id="filter-from"
          type="date"
          value={filters.dateFrom}
          max={filters.dateTo || undefined}
          aria-invalid={rangeInvalid || undefined}
          aria-describedby={rangeInvalid ? 'filter-date-error' : undefined}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="filter-to">To date</label>
        <input
          id="filter-to"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom || undefined}
          aria-invalid={rangeInvalid || undefined}
          aria-describedby={rangeInvalid ? 'filter-date-error' : undefined}
          onChange={(e) => onChange({ dateTo: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <button
          type="button"
          className={styles.clear}
          onClick={onReset}
          disabled={!hasActiveFilters(filters)}
        >
          Clear filters
        </button>
      </div>

      {rangeInvalid && (
        <p id="filter-date-error" className={styles.error} role="alert">
          The from date is after the to date.
        </p>
      )}
    </form>
  );
}
