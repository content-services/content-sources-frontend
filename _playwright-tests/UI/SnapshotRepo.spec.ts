import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import {
  closePopupsIfExist,
  getRowByNameOrUrl,
  validateSnapshotTimestamp,
} from './helpers/helpers';
import { randomUrl } from './helpers/repoHelpers';

test.describe('Snapshot Repositories', () => {
  test('Snapshot a repository', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);

    const repoName = 'one';

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
        // Click on 'Save'
        page.getByRole('button', { name: 'Save' }).first().click(),
        page.waitForResponse(
          (resp) =>
            resp.url().includes('/bulk_create/') && resp.status() >= 200 && resp.status() < 300,
        ),
        expect(page.getByRole('dialog', { name: 'Add custom repositories' })).not.toBeVisible(),
      ]);
    });

    await test.step('Verify that snapshot is successful', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Verify that snapshot is in snapshots list', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await row.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'View all snapshots' }).click();
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
      const row = await getRowByNameOrUrl(
        page,
        'https://jlsherrill.fedorapeople.org/fake-repos/revision/' + repoName,
      );
      await row.getByRole('button', { name: 'Kebab toggle' }).click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Remove repositories?')).toBeVisible();

      await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('bulk_delete') && resp.status() >= 200 && resp.status() < 300,
        ),
        page.getByRole('button', { name: 'Remove' }).click(),
      ]);

      await expect(row).not.toBeVisible();
    });
  });

  test('test snapshot manual trigger', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);
    const repoNamePrefix = 'snapshot-manual-trigger';
    const randomName = () => `${(Math.random() + 1).toString(36).substring(2, 6)}`;
    const repoName = `${repoNamePrefix}-${randomName()}`;
    const url = randomUrl();
    await deleteAllRepos(page, `&search=${repoNamePrefix}`);

    await test.step('Create a repository', async () => {
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();
      await page.getByLabel('Name').fill(`${repoName}`);
      await page.getByLabel('Introspect only').click();
      await page.getByLabel('URL').fill(url);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Edit the repository and trigger snapshot manually', async () => {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      await row.getByRole('menuitem', { name: 'Edit' }).click({ timeout: 60000 });
      await page.getByLabel('Name').fill(`${repoName}-edited`);
      await page.getByLabel('Snapshotting').click();
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      // Trigger a snapshot manually
      await row.getByRole('menuitem', { name: 'Trigger snapshot' }).click();
      //   await expect(page.getByText('Snapshot triggered successfully')).toBeVisible();
      await expect(page.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'View all snapshots' }).click();
      // asssert that triggered snapshot is in the list
      await expect(page.getByLabel('snapshot list table').locator('tbody')).toBeVisible();
      await page.getByTestId('snapshot_list_modal-ModalBoxCloseButton').click();
    });
    await deleteAllRepos(page, `&search=${repoNamePrefix}`);
  });
});
