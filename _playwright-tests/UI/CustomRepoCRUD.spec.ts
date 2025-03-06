import { test, expect, type Page } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { closePopupsIfExist } from './helpers/helpers';

export const repoNamePrefix = 'Repo-CRUD'
export const randomName = () => (Math.random()+1).toString(36).substring(2, 6);
export const repoName = `${repoNamePrefix}-${randomName()}`;
export const rank = () => Math.floor(Math.random() * 10 + 1).toString();
export const randomNum = () =>
  Math.floor(Math.random() * 10 + 1)
    .toString()
    .padStart(2, '0');

export const url = `https://stephenw.fedorapeople.org/multirepos/${rank()}/repo${randomNum()}/`;

test.describe('Custom Repositories CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Navigate to the repository page', async () => {
      await navigateToRepositories(page);
      await closePopupsIfExist(page);
    });
  });
  test('Add, Read, update, delete a repo', async ({ page }) => {
    await test.step('Delete any CRUD test repos that exist', async () => {
      await deleteAllRepos(page, `&search=${repoNamePrefix}`);
    });
    await test.step('Create a repository', async () => {
      // Click on the 'Add repositories' button
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      const repositoryModal = page.locator('div[id^="pf-modal-part"]').first();
      await expect(repositoryModal).toBeVisible();
      await expect(page.locator(':text=("Add custom repositories")')).toBeVisible();
      // Fill in the repository details
      await page.getByLabel('Name').fill(`${repoName}`);
      await page.getByLabel('URL').fill(url);
      await page.getByRole('button', { name: 'Save' }).first().click();
    });
    await test.step('Read the repo', async () => {
      // Search for the created repo
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(repoName);
      await page.getByRole('row', { name: `${repoName}` });
      if (await page.getByLabel('Kebab toggle').first().isDisabled())
        throw Error("Kebab is disabled when it really shouldn't be");
      await page.getByLabel('Kebab toggle').first().click();
      // Click on the Edit button to see the repo
      await page.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByText('Edit custom repository')).toBeVisible();
      const modalLocator = page.locator(':text=("Add custom repositories")');

      await expect(modalLocator.filter({ hasText: `${repoName}` })).toBeVisible();

      await expect(page.getByText(`${url}`)).toBeVisible();
    });
    await test.step('Update the repository', async () => {
      // Search for the created repo
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(repoName);
      await page.getByRole('row', { name: repoName });
      if (await page.getByLabel('Kebab toggle').first().isDisabled())
        throw Error("Kebab is disabled when it really shouldn't be");
      await page.getByLabel('Kebab toggle').first().click();
      // Click on the Edit button to see the repo
      await page.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByText('Edit custom repository')).toBeVisible();
      await page.getByLabel('Description').fill('Updated the description');
      await page.getByRole('button', { name: 'Save' }).first().click();
    });

    await test.step('Delete one custom repository', async () => {
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(repoName);
      await expect(page.getByRole('row', { name: repoName })).toBeVisible;
      if (await page.getByLabel('Kebab toggle').first().isDisabled())
        throw Error("Kebab is disabled when it really shouldn't be");
      await page.getByLabel('Kebab toggle').first().click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Remove repositories?')).toBeVisible();
      await page.getByRole('button', { name: 'Remove' }).click();
      await page.getByRole('textbox', { name: 'Filter by name/url' }).fill(repoName);
      await expect(page.getByRole('row', { name: repoName })).not.toBeVisible;
    });
  });
});
