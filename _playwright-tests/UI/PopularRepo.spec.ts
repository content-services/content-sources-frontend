import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/helpers';
import { deleteAllPopularRepos } from './helpers/deletePopularRepositories';

test.describe('Popular Repositories', () => {
  test('Add popular repos', async ({ page }) => {
    // Ensure no popular repos are selected.
    await deleteAllPopularRepos(page);

    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    await expect(page).toHaveTitle('Repositories - Content | RHEL');
    await page.getByRole('link', { name: 'Popular repositories' }).click();

    // Select the first row then use main side toggle menu to add it
    await page
      .getByRole('row', { name: 'EPEL 9' })
      .getByLabel('Select row 0', { exact: true })
      .click();
    // Open the drop-down menu
    await page.getByTestId('add-selected-dropdown-toggle-no-snap').click();
    // Click the first and only button in the drop-down menu
    await page.getByTestId('add-selected-repos-no-snap').click();
    // Multiple toast pop-ups about snapshotting and the code tries to close that
    await page
      .getByRole('row', { name: 'EPEL 8' })
      .getByLabel('Select row 1', { exact: true })
      .click();
    // Open the drop-down menu
    await page.getByTestId('add-selected-dropdown-toggle-no-snap').click();
    // Click the first and only button in the drop-down menu
    await page.getByTestId('add-selected-repos-no-snap').click();
    // Multiple toast pop-ups about snapshotting and the code tries to close that
    // Move to Custom repo tab
    await page.getByRole('link', { name: 'Your repositories' }).click();
    // Filter for EPEL and pick the first row
    await page.getByRole('textbox', { name: 'Filter by name/url' }).fill('EPEL');
    await page.getByRole('checkbox', { name: 'Select row 0' }).check();
    // Open kebab menu to delete it
    await page.getByTestId('custom_repositories_kebab_toggle').click()
    await page.getByRole('menuitem', { name: 'Remove 1 repositories' }).click();
    // Confirm the removal in the pop-up
    await page.getByRole('button', { name: 'Remove' }).click();
    // Filter for EPEL and pick the first row
    await page.getByRole('textbox', { name: 'Filter by name/url' }).fill('EPEL');
    await page.getByRole('checkbox', { name: 'Select row 0' }).check();
    // Open kebab menu to delete it
    await page.getByTestId('custom_repositories_kebab_toggle').click()
    await page.getByRole('menuitem', { name: 'Remove 1 repositories' }).click();
    // Confirm the removal in the pop-up
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('link', { name: 'Popular repositories' }).click();
  });
});
