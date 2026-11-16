import { expect, test } from './fixtures';

test.describe('signed out', () => {
  test.use({ signedInAs: null });

  test('a candidate signs in and sees only their own exams', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('note')).toContainText('Demo mode');

    await page.getByLabel('Your name').selectOption({ label: 'Wilmers' });
    await page.getByRole('button', { name: 'Continue as candidate' }).click();

    await expect(page).toHaveURL('/me');
    await expect(page.getByTestId('candidate-exam')).toHaveCount(3);
    await expect(page.getByText('Donelly')).toHaveCount(0);
  });

  test('a protected link survives sign-in', async ({ page }) => {
    await page.goto('/admin/sessions?country=Italy');
    await page.getByRole('button', { name: 'Continue as admin' }).click();
    await expect(page).toHaveURL('/admin/sessions?country=Italy');
    await expect(page.getByTestId('exam-row')).toHaveCount(2);
  });
});

test.describe('as a candidate', () => {
  test.use({ signedInAs: { candidateId: 1, candidateName: 'Wilmers' } });

  test('cannot open admin pages', async ({ page }) => {
    await page.goto('/admin/sessions');
    await expect(page.getByRole('heading', { name: "You don't have access to this page" })).toBeVisible();
  });

  test('opens an exam and downloads a calendar file', async ({ page }) => {
    await page.goto('/me');
    await page.getByRole('link', { name: 'Certification for Woodworking' }).click();
    await expect(page).toHaveURL('/me/exams/3');

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Add to calendar' }).click();
    expect((await download).suggestedFilename()).toBe('certification-for-woodworking-2026-04-15.ics');
  });

  test("can't open another candidate's exam", async ({ page }) => {
    await page.goto('/me/exams/4'); // Donelly's exam
    await expect(page.getByRole('heading', { name: 'Exam not found' })).toBeVisible();
  });
});
