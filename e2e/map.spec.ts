import { expect, test } from './fixtures';

test('shows one marker per venue, with its sessions in the popup', async ({ page }) => {
  await page.goto('/exam-map');

  // UK, Germany and Italy: the two Italy records share one marker.
  const markers = page.locator('.leaflet-marker-icon');
  await expect(markers).toHaveCount(3);

  await page.getByRole('button', { name: 'Italy: 2 sessions' }).click();
  await expect(page.locator('.leaflet-popup')).toContainText('Skydiving License 1');
  await expect(page.locator('.leaflet-popup')).toContainText('VICTVS Annual Assessment');

  await expect(page.getByRole('region', { name: 'Sessions by venue' })).toContainText(
    'Italy: 2 sessions (2 pending)',
  );
});
