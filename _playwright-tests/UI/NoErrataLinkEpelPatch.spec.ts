
import { test, expect } from 'test-utils';
import { navigateToAdvisories } from './helpers/navHelpersPatch';

test.describe('Patch EPEL advisories', () => {
  test('Check errata link should NOT appear on non Red Hat advisories details page.', async ({ page }) => {

    await navigateToAdvisories(page);

    await expect(page.getByRole('heading', { name: 'Most impactful advisories' })).toBeVisible();

    await page.getByRole('textbox', { name: 'search-field' })
      .fill('FEDORA-EPEL-2025-53cc9fe810');

    const advisoryRow = page.locator('tbody tr', { hasText: 'FEDORA-EPEL-2025-53cc9fe810' });
    await expect(advisoryRow).toBeVisible({ timeout: 10000 });  // table load wait

    await advisoryRow.getByRole('button', { name: 'Details' }).click();

    await expect(
      page.locator('#expanded-content1-2')
    ).not.toContainText('View packages and errata at access.redhat.com');

    await page.getByRole('button', { name: 'Reset filters' }).click();
  });
});
