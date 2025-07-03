import { test, expect } from '@playwright/test';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { randomName, randomUrl } from './helpers/repoHelpers';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';

const repoNamePrefix = 'Repo-RBAC';
const repoName = `${repoNamePrefix}-${randomName()}`;
const url = randomUrl();

// Define a test group for admin user
test.describe('Create, update, and read a repo as admin user', () => {
  test.use({ storageState: '.auth/admin_user.json' });
  test.describe.configure({ mode: 'serial' });

  test('Login as admin and manage repo', async ({ page }) => {
    await test.step('Create a repository', async () => {
      await navigateToRepositories(page);
      await closePopupsIfExist(page);
      await deleteAllRepos(page, `&search=${repoNamePrefix}`);
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();

      await page.getByLabel('Name').fill(repoName);
      await page.getByLabel('Introspect only').click();
      await page.getByLabel('URL').fill(url);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    });

    await test.step('Read the repo', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible();
      await row.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByRole('dialog', { name: 'Edit custom repository' })).toBeVisible();
      await expect(page.getByPlaceholder('Enter name', { exact: true })).toHaveValue(repoName);
      await expect(page.getByPlaceholder('https://', { exact: true })).toHaveValue(url);
    });

    await test.step('Update the repository', async () => {
      await page.getByPlaceholder('Enter name', { exact: true }).fill(`${repoName}-Edited`);
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    });
  });

  // Define a separate test group for read-only user
  test.describe('Check read-only user can view but not edit the repo', () => {
    test.use({
      storageState: '.auth/read-only.json',
      extraHTTPHeaders: process.env.READONLY_TOKEN
        ? { Authorization: process.env.READONLY_TOKEN }
        : {},
    });

    test('Login as read-only user and attempt to edit', async ({ page }) => {
      await navigateToRepositories(page);
      await closePopupsIfExist(page);
      const row = await getRowByNameOrUrl(page, `${repoName}-Edited`);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      // This is the critical assertion for permissions
      await expect(row.getByRole('menuitem', { name: 'Edit' })).not.toBeVisible({ timeout: 500 });

      // Additionally, check if the "Add repositories" button is disabled
      const repoButton = page.getByRole('button', { name: 'Add repositories', exact: true });
      await expect(repoButton).toBeDisabled();
    });
  });
});
