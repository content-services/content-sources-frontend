// _playwright-tests/UI/RBAC.spec.ts
import { test, expect } from '@playwright/test';
// ... other imports ...
import fs from 'fs';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { randomName, randomUrl } from './helpers/repoHelpers';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';

const repoNamePrefix = 'Repo-RBAC';
const repoNameFile = 'repoName.txt';

// Function to get or generate repo name using file persistence
const getRepoName = (): string => {
  if (fs.existsSync(repoNameFile)) {
    const repoName = fs.readFileSync(repoNameFile, 'utf8');
    console.log(`Loaded repo name from file: ${repoName}`);
    return repoName;
  }
  const repoName = `${repoNamePrefix}-${randomName()}`;
  fs.writeFileSync(repoNameFile, repoName);
  console.log(`Generated and saved repo name: ${repoName}`);
  return repoName;
};

const url = randomUrl();

test.beforeAll('Clean up existing repo name file', async () => {
  if (fs.existsSync(repoNameFile)) {
    console.log(`Deleting old repo name file: ${repoNameFile}`);
    fs.unlinkSync(repoNameFile);
  }
  // await deleteAllRepos(page, `&search=${repoNamePrefix}`);
});

// Define a test group for admin user
test.describe('Admin User Tests', () => {
  // Use the default user's storageState for all tests in this describe block
  test.use({ storageState: '.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    // This beforeEach will run for all tests in this describe block
    await navigateToRepositories(page);
    await closePopupsIfExist(page);
  });

  test('Login as user 1 (admin) and manage repo', async ({ page }) => {
    // All setup is done in beforeEach for this user
    // This test now focuses purely on the actions after navigation
    await test.step('Create a repository', async () => {
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();

      const repoName = getRepoName();
      await page.getByLabel('Name').fill(repoName);
      await page.getByLabel('Introspect only').click();
      await page.getByLabel('URL').fill(url);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    });

    await test.step('Read the repo', async () => {
      const repoName = getRepoName();
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible();
      await row.getByLabel('Kebab toggle').click();
      await row.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByRole('dialog', { name: 'Edit custom repository' })).toBeVisible();
      await expect(page.getByPlaceholder('Enter name', { exact: true })).toHaveValue(repoName);
      await expect(page.getByPlaceholder('https://', { exact: true })).toHaveValue(url);
    });

    await test.step('Update the repository', async () => {
      const repoName = getRepoName();
      await page.getByPlaceholder('Enter name', { exact: true }).fill(`${repoName}-Edited`);
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    });
  });
});

// Define a separate test group for read-only user
test.describe('Read-Only User Tests', () => {
  // Use the read-only user's storageState for all tests in this describe block
  test.use({ storageState: '.auth/contentPlaywrightReader.json' });

  test.beforeEach(async ({ page }) => {
    // This beforeEach runs for tests in this describe block
    await page.pause();
    await navigateToRepositories(page);
    await closePopupsIfExist(page);
  });

  test('Read-only user can view but not edit', { tag: '@read-only' }, async ({ page }) => {
    // No need for browser.newContext() or switchToUser here, `page` already has storageState loaded
    const repoName = getRepoName(); // Get the name from the previous test
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
