import { normaliseCountry } from './country';
import type { ExamLocation } from './types';

/**
 * The time zone each venue's clocks follow. Every country in the data has one zone,
 * so the country is enough today; ideally the API would send a zone per venue.
 */
const COUNTRY_TIME_ZONES: Record<string, string> = {
  'United Kingdom': 'Europe/London',
  Germany: 'Europe/Berlin',
  Italy: 'Europe/Rome',
};

export function venueTimeZone(location: ExamLocation | null | undefined): string {
  if (!location) return 'UTC';
  return COUNTRY_TIME_ZONES[normaliseCountry(location.country)] ?? 'UTC';
}
