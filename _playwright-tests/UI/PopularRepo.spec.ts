import { describe } from 'node:test';
import { test, type Page } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { closePopupsIfExist } from './helpers/helpers';

describe('Popular Repositories', () => {
  test('Clean - Delete any current repos that exist', async ({ page }) => {
    await deleteAllRepos(page);
  });

  test('Navigate to Popular Repos tab, assert the Add button is displayed', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    const AddMenuButton = page.locator('[data-ouia-component-id="add_checked_repos-with-snap"]');
    await page.getByRole('link', { name: 'Popular repositories' }).click();


    // Wait for the Add button to become enabled (up to 10 seconds)
    await AddMenuButton.first().isEnabled({ timeout: 10000 });
  });

  test('Add popular repos', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    const AddMenuButton = page.locator('[data-ouia-component-id="add_popular_repo_toggle"]');
    const AddButton = page.locator('[data-ouia-component-id="add_popular_repo"]');
    const AddButtonNoSnap = page.locator('[data-ouia-component-id="add-popular_repo_without-snapshotting"]');

    await page.goto('https://stage.foo.redhat.com:1337/insights/content/repositories#SIDs=&tags=');
    await page.getByRole('link', { name: 'Popular repositories' }).click();

    // Wait for the Add button to become enabled (up to 10 seconds)
    await AddButton.first().isEnabled({ timeout: 10000 });
    await page.getByRole('row', { name: 'Select row 0 EPEL 9' }).getByLabel('Select', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'Add without snapshotting' }).click();
    await page.getByRole('gridcell', { name: 'Add Select' }).getByLabel('Select').click();
    await page.getByRole('menuitem', { name: 'Add without snapshotting' }).click();
    await page.getByRole('link', { name: 'Your repositories' }).click();
    await page.getByRole('textbox', { name: 'Filter by name/url' }).click();
    await page.getByRole('textbox', { name: 'Filter by name/url' }).fill('EPEL');
    await page.locator('#topPaginationWidgetId-top-toggle').click({
      button: 'right'
    });
    await page.locator('#topPaginationWidgetId-top-toggle').click();
    await page.getByRole('menuitem', { name: '10 per page' }).press('Escape');
    await page.getByRole('checkbox', { name: 'Select row 0' }).check();
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Remove 1 repositories' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.locator('#topPaginationWidgetId-top-toggle').click();
    await page.getByRole('menuitem', { name: '10 per page' }).press('Escape');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Remove 1 repositories' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('link', { name: 'Popular repositories' }).click();
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.locator('#topPaginationWidgetId-top-toggle').click();
    await page.getByRole('menuitem', { name: '10 per page' }).press('Escape');


  });
});