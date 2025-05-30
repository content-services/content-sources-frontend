import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import {
  closePopupsIfExist,
  getRowByNameOrUrl,
  validateSnapshotTimestamp,
} from './helpers/helpers';

test.describe('Snapshot Repositories', () => {
  test('Snapshot a repository', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    const repoName = 'one';
    const editedRepoName = `${repoName}-edited`;

    await test.step('Cleanup repository, if using the same url', async () => {
      await deleteAllRepos(
        page,
        `&url=https://jlsherrill.fedorapeople.org/fake-repos/revision/` + repoName,
      );
    });

    await test.step('Open the add repository modal', async () => {
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();
    });

    await test.step('Fill in the repository details', async () => {
      await page.getByLabel('Name').fill(repoName);
      await page
        .getByLabel('URL')
        .fill('https://jlsherrill.fedorapeople.org/fake-repos/revision/' + repoName);
      await page.getByLabel('Introspect only').click();
    });

    await test.step('Filter by architecture', async () => {
      await page.getByRole('button', { name: 'filter architecture' }).click();
      await page.getByRole('menuitem', { name: 'x86_64' }).click();
    });

    await test.step('Filter by version', async () => {
      await page.getByRole('button', { name: 'filter version' }).click();
      await page.getByRole('menuitem', { name: 'el9' }).click();
      await page.getByRole('menuitem', { name: 'el8' }).click();
      await page.getByRole('button', { name: 'filter version' }).click();
    });

    await test.step('Submit the form and wait for modal to disappear', async () => {
      await Promise.all([
        page.getByRole('button', { name: 'Save' }).first().click(),
        page.waitForResponse(
          (resp) =>
            resp.url().includes('/bulk_create/') && resp.status() >= 200 && resp.status() < 300,
        ),
        expect(page.getByRole('dialog', { name: 'Add custom repositories' })).not.toBeVisible(),
      ]);
    });

    await test.step('Edit the repository', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      await row.getByRole('menuitem', { name: 'Edit' }).click({ timeout: 60000 });
      await page.getByLabel('Name').fill(editedRepoName);
      await page.getByLabel('Snapshotting').click();
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    });

    await test.step('Trigger snapshot manually', async () => {
      const edited_row = await getRowByNameOrUrl(page, editedRepoName);
      // prevention of the error regarding re-triggering introspection task too early after the previous one
      await page.waitForTimeout(60000);
      await edited_row.getByLabel('Kebab toggle').click();
      // Trigger a snapshot manually
      await edited_row.getByRole('menuitem', { name: 'Trigger snapshot' }).click();
      await expect(edited_row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await edited_row.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'View all snapshots' }).click();
      // Verify that snapshot is in snapshots list
      await expect(page.getByLabel('SnapshotsView list of').locator('tbody')).toBeVisible();
      const snapshotTimestamp = await page
        .getByLabel('SnapshotsView list of')
        .locator('tbody')
        .textContent();
      if (snapshotTimestamp != null) {
        if ((await validateSnapshotTimestamp(snapshotTimestamp, 10)) == false) {
          throw new Error('Most recent snapshot timestamp is older than 10 minutes!');
        }
      } else {
        throw new Error('Snapshot timestamp not found!');
      }
      await page.getByLabel('Close', { exact: true }).click();
    });

    await test.step('Delete created repository', async () => {
      const edited_row = await getRowByNameOrUrl(
        page,
        'https://jlsherrill.fedorapeople.org/fake-repos/revision/' + repoName,
      );
      await edited_row.getByLabel('Kebab toggle').click();
      await edited_row.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Remove repositories?')).toBeVisible();

      await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('bulk_delete') && resp.status() >= 200 && resp.status() < 300,
        ),
        page.getByRole('button', { name: 'Remove' }).click(),
      ]);

      await expect(edited_row).not.toBeVisible();
    });
  });
});
