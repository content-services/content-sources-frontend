import { describe } from 'node:test';
import { test } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/helpers';
import { deleteAllPopularRepos } from './helpers/deletePopularRepositories';

describe('Popular Repositories', () => {
  test('Add popular repos', async ({ page }) => {
    // Ensure no popular repos are selected
    await deleteAllPopularRepos(page);

    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    await page.getByRole('link', { name: 'Popular repositories' }).click();

    await page
      .getByRole('row', { name: 'Select row 0 EPEL 9' })
      .getByLabel('Select', { exact: true })
      .click();
    await page.getByRole('menuitem', { name: 'Add without snapshotting' }).click();
    await page.getByRole('gridcell', { name: 'Add Select' }).getByLabel('Select').click();
    await page.getByRole('menuitem', { name: 'Add without snapshotting' }).click();
    await page.getByRole('link', { name: 'Your repositories' }).click();
    await page.getByRole('textbox', { name: 'Filter by name/url' }).click();
    await page.getByRole('textbox', { name: 'Filter by name/url' }).fill('EPEL');
    await page.getByRole('checkbox', { name: 'Select row 0' }).check();
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Remove 1 repositories' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Remove 1 repositories' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('link', { name: 'Popular repositories' }).click();
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
  });
});
