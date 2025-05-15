import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';
import { logInWithUsernameAndPassword, logout, logInWithUser1 } from "../helpers/loginHelpers";
import { randomUrl } from './helpers/repoHelpers';

export const url = randomUrl();

export const repoNamePrefix = 'Repo-RBAC';
export const randomName = () => (Math.random() + 1).toString(36).substring(2, 6);
export const repoName = `${repoNamePrefix}-${randomName()}`;

test.describe('User Permissions Test', () => {
  test('Default user configures repo', async ({ browser }) => {
    const context = await browser.newContext({ storageState: '.auth/default_user.json' });
    const page = await context.newPage();
    // await deleteAllRepos(page, `&search=${repoNamePrefix}`);
    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    await test.step('Create a repository', async () => {
        // Click on the 'Add repositories' button
        // HMS-5268 There are two buttons on the ZeroState page
        await page.getByRole('button', { name: 'Add repositories' }).first().click();
        await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();
  
        // Fill in the repository details
        await page.getByLabel('Name').fill(repoName);
        await page.getByLabel('Introspect only').click();
        await page.getByLabel('URL').fill(url);
        await page.getByRole('button', { name: 'Save', exact: true }).click();
      });
      await test.step('Read the repo', async () => {
        // Search for the created repo
        await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(repoName);
        const row = await getRowByNameOrUrl(page, repoName);
        await expect(row.getByText('Valid')).toBeVisible();
        await row.getByLabel('Kebab toggle').click();
        // Click on the Edit button to see the repo
        await row.getByRole('menuitem', { name: 'Edit' }).click();
        await expect(page.getByRole('dialog', { name: 'Edit custom repository' })).toBeVisible();
        // Assert we can read some values
        await expect(page.getByPlaceholder('Enter name', { exact: true })).toHaveValue(repoName);
        await expect(page.getByPlaceholder('https://', { exact: true })).toHaveValue(url);
      });
      await test.step('Update the repository', async () => {
        await page.getByPlaceholder('Enter name', { exact: true }).fill(`${repoName}-Edited`);
        await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      });
      await page.context().clearCookies();
      await logout(page);
      await page.context().close();
    });

  test('Read-only user can view but not edit', async ({ browser }) => {
    const context = await browser.newContext({ storageState: '.auth/readonly_user.json' });
    const page = await context.newPage();
    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    // Assert read-only user can list but not edit previously created repo
    const row = await getRowByNameOrUrl(page, repoName);
    await expect(row.getByText('Valid')).toBeVisible();
    await row.getByLabel('Kebab toggle').click();
    // Assert we cannot click on the Edit button to see the repo
    await expect(row.locator(".pf-v5-c-menu__list")).toBeVisible({ timeout: 5000 }); // Confirm menu is open
    await expect(row.getByRole("menuitem", { name: "Edit" })).not.toBeVisible({ timeout: 1000 });
    // You do not have the required permissions to perform this action.
    const repoButton = page.getByRole('button', { name: 'Add repositories', exact: true });
    await expect(repoButton).toBeDisabled(); // Verify button is disabled
  });
 });