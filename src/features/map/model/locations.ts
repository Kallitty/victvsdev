import { type Exam, type ExamStatus, normaliseCountry } from '@/features/exams';

export interface LocationGroup {
  key: string;
  label: string;
  latitude: number;
  longitude: number;
  exams: Exam[];
  statusCounts: Record<ExamStatus, number>;
}

/** Rounded to ~11 m, so separate location records at the same venue share one marker. */
const coordinateKey = (latitude: number, longitude: number) =>
  `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

/** One group per venue, sorted by name. Exams with no location are left out. */
export function groupExamsByLocation(exams: readonly Exam[]): LocationGroup[] {
  const groups = new Map<string, LocationGroup & { countries: Set<string> }>();

  for (const exam of exams) {
    if (!exam.location) continue;
    const { latitude, longitude } = exam.location;
    const key = coordinateKey(latitude, longitude);

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        label: '',
        latitude,
        longitude,
        exams: [],
        statusCounts: { pending: 0, started: 0, finished: 0 },
        countries: new Set<string>(),
      };
      groups.set(key, group);
    }
    group.exams.push(exam);
    group.statusCounts[exam.status] += 1;
    group.countries.add(normaliseCountry(exam.location.country));
  }

  return [...groups.values()]
    .map(({ countries, ...group }) => ({ ...group, label: [...countries].sort().join(' / ') }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
