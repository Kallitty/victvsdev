import { EXAM_STATUSES, STATUS_LABELS } from '@/features/exams';

import type { LocationGroup } from '../model/locations';
import styles from './VenueList.module.css';

const describeCounts = (group: LocationGroup) =>
  EXAM_STATUSES.filter((status) => group.statusCounts[status] > 0)
    .map((status) => `${group.statusCounts[status]} ${STATUS_LABELS[status].toLowerCase()}`)
    .join(', ');

/** Everything the map shows, as text, for keyboard and screen-reader users. */
export function VenueList({ groups }: { groups: readonly LocationGroup[] }) {
  return (
    <section className={styles.summary} aria-labelledby="venue-list-heading">
      <h3 id="venue-list-heading">Sessions by venue</h3>
      <ul>
        {groups.map((group) => (
          <li key={group.key}>
            <strong>{group.label}</strong>: {group.exams.length} sessions ({describeCounts(group)})
          </li>
        ))}
      </ul>
    </section>
  );
}
