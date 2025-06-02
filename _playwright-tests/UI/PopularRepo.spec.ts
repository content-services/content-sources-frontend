import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';
import { deleteAllPopularRepos } from './helpers/deletePopularRepositories';

const repoName10 = 'EPEL 10 Everything x86_64';
const repoName9 = 'EPEL 9 Everything x86_64';
const repoName8 = 'EPEL 8 Everything x86_64';
const repos = [repoName10, repoName9, repoName8];

test.describe('Popular Repositories', () => {
  test('Test adding and removing popular repos', async ({ page }) => {
    // Ensure no popular repos are selected.
    await deleteAllPopularRepos(page);

    await navigateToRepositories(page);
    await closePopupsIfExist(page);
    await expect(page).toHaveTitle('Repositories - Content | RHEL');

    await test.step('Select the Popular repos tab', async () => {
      await page.getByRole('link', { name: 'Popular repositories' }).click();
      await expect(page.getByTestId('popular_repos_table')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Add selected repositories' })).toBeVisible();
    });

    await test.step('Add the 3 popular repos without snapshotting', async () => {
      for (let i = 0; i < repos.length; i++) {
        await page
          .getByRole('row', { name: repos[i] })
          .getByLabel(`Select row ${i}`, { exact: true })
          .click();
      }
      await page.getByTestId('add-selected-dropdown-toggle-no-snap').click();
      await page.getByRole('menuitem', { name: 'Add 3 repositories without snapshotting' }).click();
    });

    await test.step('Check buttons have changed from Add to Remove', async () => {
      for (const repoName of repos) {
        await expect(
          page
            .getByRole('row', { name: repoName })
            .getByTestId('remove_popular_repo')
            .getByText('Remove'),
        ).toBeVisible();
      }
    });

    await test.step('Apply filter and clear it', async () => {
      await page.getByRole('searchbox', { name: 'Filter by name/url' }).fill(repoName8);
      const rows = page.locator('table tbody tr');
      await expect(rows).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
      await page.getByRole('button', { name: 'Clear filters' }).click();
    });

    await test.step('Move to Custom repo tab', async () => {
      await page.getByRole('link', { name: 'Your repositories' }).click();
      await expect(page.getByTestId('custom_repositories_table')).toBeVisible();
    });

    await test.step('Check all popular repos have valid status', async () => {
      for (const repoName of repos) {
        const row = await getRowByNameOrUrl(page, repoName);
        await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      }
    });

    await test.step('Use kebab menu to delete all repos', async () => {
      for (const repoName of repos) {
        const row = await getRowByNameOrUrl(page, repoName);
        await row.getByRole('checkbox', { name: 'Select row' }).check();

        await page.getByTestId('delete-kebab').click();
      }
      await page.getByRole('menuitem', { name: 'Remove 3 repositories' }).click();
      // Confirm the removal in the pop-up
      await page
        .getByRole('dialog', { name: 'Remove repositories?' })
        .getByRole('button', { name: 'Remove' })
        .click();
    });
  });
});
