import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import path from 'path';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';
import { deleteAllRepos } from './helpers/deleteRepositories';

const uploadRepoName = 'Upload Repo!';

test.describe('Upload Repositories', () => {
  test('Upload repo creation and deletion', async ({ page }) => {
    await test.step('Clean - Delete any current repos that exist', async () => {
      await deleteAllRepos(page, `&search=${uploadRepoName}`);
    });

    await test.step('Navigate to repositories', async () => {
      await closePopupsIfExist(page);
      await navigateToRepositories(page);
    });

    await test.step('Create upload repository', async () => {
      // Click 'Add repositories' button
      await page.getByRole('button', { name: 'Add repositories' }).first().click();

      // Wait for the modal to be visible
      await expect(page.locator('div[id^="pf-modal-part"]').first()).toBeVisible();

      // Fill in the 'Enter name' input
      const nameInput = page.getByPlaceholder('Enter name');
      await nameInput.click();
      await nameInput.fill(uploadRepoName);

      // Check the 'Upload' checkbox
      await page.getByLabel('Upload', { exact: true }).check();

      // Filter by architecture
      await page.getByRole('button', { name: 'filter architecture' }).click();
      await page.getByRole('menuitem', { name: 'x86_64' }).click();

      // Filter by version
      const versionFilterButton = page.getByRole('button', { name: 'filter version' });
      await versionFilterButton.click();
      await page.getByRole('menuitem', { name: 'el9' }).click();
      await page.getByRole('menuitem', { name: 'el8' }).click();
      await versionFilterButton.click(); // Close the filter dropdown

      // Wait for the successful API call
      const errorElement = page.locator('.pf-v5-c-helper-text__item.pf-m-error');

      if (await errorElement.isVisible()) {
        throw new Error('Error message in element is visible');
      }

      // Click 'Save and upload content'
      await Promise.all([
        page.getByRole('button', { name: 'Save and upload content' }).click(),
        page.waitForResponse(
          (resp) =>
            resp.url().includes('/bulk_create/') && resp.status() >= 200 && resp.status() < 300,
        ),
      ]);

      const dragBoxSelector = page.locator('#pf-modal-part-1  > div');

      // Handle the file chooser and upload the file
      await dragBoxSelector
        .locator('input[type=file]')
        .setInputFiles(path.join(__dirname, './fixtures/libreOffice.rpm'));

      // Verify the upload completion message
      await expect(page.getByText('All uploads completed!')).toBeVisible();

      // Confirm changes
      await page.getByRole('button', { name: 'Confirm changes' }).click();

      // There might be many rows at this point, we need to ensure that we filter the repo
      const row = await getRowByNameOrUrl(page, uploadRepoName);
      // Verify the 'In progress' status
      await expect(row.getByText('In progress')).toBeVisible();
    });

    await test.step('Delete one upload repository', async () => {
      const row = await getRowByNameOrUrl(page, uploadRepoName);
      // Check if the 'Kebab toggle' button is disabled
      await row.getByRole('button', { name: 'Kebab toggle' }).click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();

      // Click on the 'Remove' button
      await Promise.all([
        // Verify the 'Remove repositories?' dialog is visible
        expect(page.getByText('Remove repositories?')).toBeVisible(),
        // Wait for the successful API call
        page.waitForResponse(
          (resp) =>
            resp.url().includes('bulk_delete') && resp.status() >= 200 && resp.status() < 300,
        ),
        // Click the 'Remove' button
        page.getByRole('button', { name: 'Remove' }).click(),
        await expect(row).not.toBeVisible(),
      ]);
    });

    await test.step('Clean - Double check upload repo for deletion', async () => {
      await deleteAllRepos(page, `&search=${uploadRepoName}`);
    });
  });
});
