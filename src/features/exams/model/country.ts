/**
 * The API has "Italy" (location 3) and "italy" (location 5) at the same coordinates.
 * Normalise so users never see the same country twice.
 */
export function normaliseCountry(country: string | null | undefined): string {
  const cleaned = (country ?? '').trim().replace(/\s+/g, ' ');
  if (cleaned === '') return 'Unknown';
  return cleaned
    .split(' ')
    .map((word) => (word === word.toLowerCase() ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}
