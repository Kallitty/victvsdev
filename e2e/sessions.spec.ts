import { expect, test } from './fixtures';

test.describe('sessions', () => {
  test('lists sessions soonest first, with venue times', async ({ page }) => {
    await page.goto('/sessions');

    const rows = page.getByTestId('exam-row');
    await expect(rows).toHaveCount(5);
    await expect(rows.first()).toContainText('Medical Examinations 2');
    // 10:15 UTC shown at the Berlin venue, in summer time.
    await expect(rows.filter({ hasText: 'Certification for Woodworking' })).toContainText(
      'Wed 15 Apr 2026, 12:15 CEST',
    );
  });

  test('starts an exam, and the change survives a reload', async ({ page, api }) => {
    await page.goto('/sessions');

    await page.getByRole('button', { name: 'Start Certification for Woodworking' }).click();

    await expect(page.getByText('Certification for Woodworking is now started.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finish Certification for Woodworking' })).toBeVisible();
    expect(api.exams.find((e) => e.id === 3)?.status).toBe('started');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Finish Certification for Woodworking' })).toBeVisible();
  });

  test('asks for confirmation before finishing', async ({ page, api }) => {
    await page.goto('/sessions');

    await page.getByRole('button', { name: 'Finish Medical Examinations 1' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(api.exams.find((e) => e.id === 1)?.status).toBe('started');

    await page.getByRole('button', { name: 'Finish Medical Examinations 1' }).click();
    await page.getByRole('button', { name: 'Confirm finish' }).click();
    await expect(page.getByTestId('exam-row').filter({ hasText: 'Medical Examinations 1' })).toContainText(
      'Complete',
    );
  });

  test('rolls back and explains when the server rejects a change', async ({ page, api }) => {
    api.rejectNextStatusChange = true;
    await page.goto('/sessions');

    await page.getByRole('button', { name: 'Start Skydiving License 1' }).click();

    await expect(
      page.getByText(/Couldn't update Skydiving License 1\. Invalid status transition\./),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Skydiving License 1' })).toBeVisible();
  });

  test('filters are kept in the URL and survive a reload', async ({ page }) => {
    await page.goto('/sessions');

    await page.getByLabel('Filter by country').selectOption('Italy');
    await expect(page).toHaveURL(/country=Italy/);
    await expect(page.getByTestId('exam-row')).toHaveCount(2); // "Italy" and "italy" merged

    await page.reload();
    await expect(page.getByTestId('exam-row')).toHaveCount(2);
    await expect(page.getByLabel('Filter by country')).toHaveValue('Italy');
  });
});
