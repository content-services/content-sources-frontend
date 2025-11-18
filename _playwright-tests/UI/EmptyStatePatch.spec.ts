import { test, expect } from 'test-utils';
import { navigateToSystems } from './helpers/navHelpersPatch';

test.describe('Empty State Patch', () => {
  test('Validate Patch Empty state', async ({ page }) => {

    await navigateToSystems(page);

    await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible();

    const table = page.getByRole('grid');
    await expect(table).toBeVisible({ timeout: 30000 });

    const searchBox = page.getByRole('textbox', { name: /search-field/i });
    await searchBox.fill('sskfsl');

    await page.waitForLoadState('networkidle');

    await table.scrollIntoViewIfNeeded();

    await expect(
      page.getByRole('heading', { name: /No matching systems found/i })
    ).toBeVisible();

    await expect(
      page.getByText(/To continue, edit your filter settings and try again/i)
    ).toBeVisible();

    await page.getByRole('button', { name: /Reset filters/i }).click();
  });
});
