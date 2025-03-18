import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';

export const repoNamePrefix = 'Repo-CRUD';
export const randomName = () => (Math.random() + 1).toString(36).substring(2, 6);
export const repoName = `${repoNamePrefix}-${randomName()}`;
export const rank = () => Math.floor(Math.random() * 10 + 1).toString();
export const randomNum = () =>
  Math.floor(Math.random() * 10 + 1)
    .toString()
    .padStart(2, '0');

export const url = `https://stephenw.fedorapeople.org/multirepos/${rank()}/repo${randomNum()}/`;

test.describe('Custom Repositories CRUD', () => {
  test('Add, Read, update, delete a repo', async ({ page }) => {
    await test.step('Delete any CRUD test repos that exist', async () => {
      await navigateToRepositories(page);
      await closePopupsIfExist(page);
      await deleteAllRepos(page, `&search=${repoNamePrefix}`);
    });
    await test.step('Create a repository', async () => {
      // Click on the 'Add repositories' button
      // HMS-5268 There are two buttons on the ZeroState page
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();

      // Fill in the repository details
      await page.getByLabel('Name').fill(`${repoName}`);
      await page.getByLabel('Introspect only').click();
      await page.getByLabel('URL').fill(url);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    });
    await test.step('Wait for status to be "Valid"', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });
    await test.step('Read the repo', async () => {
      // Search for the created repo
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(repoName);
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      // Click on the Edit button to see the repo
      await row.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByRole('dialog', { name: 'Edit custom repository' })).toBeVisible();
      // Assert we can read some values
      await expect(page.getByPlaceholder('Enter name', { exact: true })).toHaveValue(`${repoName}`);
      await expect(page.getByPlaceholder('https://', { exact: true })).toHaveValue(`${url}`);
    });
    await test.step('Update the repository', async () => {
      await page.getByPlaceholder('Enter name', { exact: true }).fill(`${repoName}-Edited`);
      await page.getByLabel('Snapshotting').click();
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    });
    await test.step('Wait for status to be "Valid"', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });
    await test.step('Confirm repo was updated', async () => {
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(`${repoName}-Edited`);
      const row = await getRowByNameOrUrl(page, `${repoName}-Edited`);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      // Click on the Edit button to see the repo
      await row.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByText('Edit custom repository')).toBeVisible();
      // Assert we can read some values
      await expect(page.getByPlaceholder('Enter name', { exact: true })).toHaveValue(
        `${repoName}-Edited`,
      );
      await expect(page.getByPlaceholder('https://', { exact: true })).toHaveValue(`${url}`);
      await page.getByRole('button', { name: 'Cancel' }).click();
    });
    await test.step('Delete one custom repository', async () => {
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(`${repoName}-Edited`);
      const row = await getRowByNameOrUrl(page, `${repoName}-Edited`);
      await row.getByLabel('Kebab toggle').click();
      await row.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Remove repositories?')).toBeVisible();
      await page.getByRole('button', { name: 'Remove' }).click();
      await expect(page.getByRole('row', { name: repoName })).not.toBeVisible;
    });
  });
});
