
import { test, expect } from 'test-utils';
import { navigateToAdvisories } from './helpers/navHelpersPatch';

test.describe('Patch select single', () => {
  test('Test select single on advisories/systems.', async ({ page }) => {

    await navigateToAdvisories(page);

    await expect(page.getByRole('heading', { name: 'Most impactful advisories' })).toBeVisible();

    await page.getByRole('textbox', { name: 'search-field' })
      .fill('RHBA-2025:19556');

    const advisoryRow = page.locator('tbody tr', { hasText: 'RHBA-2025:19556' });
    await expect(advisoryRow).toBeVisible({ timeout: 10000 });  // table load wait

    await page.getByRole('gridcell', { name: 'RHBA-2025:19556' }).click();

    await expect(page.getByRole('checkbox', { name: 'Select all' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Select row 0' }).check();

    await expect(page.locator('#toggle-checkbox')).toContainText('1 selected');

  });
});
