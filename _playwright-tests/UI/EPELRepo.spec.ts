import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';

const repoName10 = 'EPEL 10 Everything x86_64';
const repoName9 = 'EPEL 9 Everything x86_64';
const repoName8 = 'EPEL 8 Everything x86_64';
const repos = [repoName10, repoName9, repoName8];

test.describe('EPEL Repositories', () => {
  test('Tests for validity, filtering, and permissions of EPEL repositories', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);
    await expect(page).toHaveTitle('Repositories - Content | RHEL');

    await test.step('Select only the EPEL tab', async () => {
      // Deselect the Custom repos tab to only show the EPEL repos
      await page.getByRole('button', { name: 'Custom', exact: true }).click();
      const rows = page.locator('table tbody tr');
      await expect(rows).toHaveCount(3);
    });

    await test.step('Check all EPEL repos have valid status', async () => {
      for (const repoName of repos) {
        const row = await getRowByNameOrUrl(page, repoName);
        await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Apply filter and clear it', async () => {
      await page.getByRole('searchbox', { name: 'Filter by name/url' }).fill(repoName8);
      const rows = page.locator('table tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
      await page.getByRole('button', { name: 'Clear filters' }).click();
    });

    await test.step('Verify that the EPEL repos cannot be edited or deleted', async () => {
      for (const repoName of repos) {
        // Verify bulk deletion is disabled
        const row = await getRowByNameOrUrl(page, repoName);
        await row.getByRole('checkbox', { name: 'Select row' }).check();
        await expect(page.getByTestId('delete-kebab')).toBeDisabled();

        // Verify repo cannot be deleted by row
        await row.getByLabel('Kebab toggle').click();
        await expect(page.getByRole('menuitem', { name: 'Delete' })).not.toBeVisible();

        // Verify repo cannot be edited
        await expect(page.getByRole('menuitem', { name: 'Edit' })).not.toBeVisible();

        await row.getByRole('checkbox', { name: 'Select row' }).check();
      }
    });
  });
});
