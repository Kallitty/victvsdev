import { expect, test } from './fixtures';

test('follows the OS on a first visit, then remembers the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/sessions');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('switch', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
