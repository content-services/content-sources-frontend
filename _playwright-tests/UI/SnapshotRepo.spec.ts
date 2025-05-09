import { test, expect } from '@playwright/test';
import { navigateToRepositories, navigateToTemplates } from './helpers/navHelpers';
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
});

test('Snapshot deletion', async ({ page }) => {
  await navigateToRepositories(page);
  await closePopupsIfExist(page);
  const repoNamePrefix = 'snapshot-deletion';
  const randomName = () => `${(Math.random() + 1).toString(36).substring(2, 6)}`;
  const repoName = `${repoNamePrefix}-${randomName()}`;
  const templateName = `Test-template-for-snapshot-deletion-${randomName()}`;

  await test.step('Create a repository', async () => {
    await page.getByRole('button', { name: 'Add repositories' }).first().click();
    await expect(page.getByRole('dialog', { name: 'Add custom repositories' })).toBeVisible();
    await page.getByLabel('Name').fill(`${repoName}`);
    await page.getByLabel('Snapshotting').click();
    await page.getByLabel('URL').fill('https://fedorapeople.org/groups/katello/fakerepos/zoo/');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const row = await getRowByNameOrUrl(page, repoName);
    await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
  });

  await test.step('Edit the repository', async () => {
    for (let i = 2; i <= 4; i++) {
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await test.step(`Edit repository and create snapshot ${i}`, async () => {
        // Open the edit modal
        await row.getByLabel('Kebab toggle').click();
        await row.getByRole('menuitem', { name: 'Edit' }).click({ timeout: 60000 });
        await page
          .getByLabel('URL')
          .fill(`https://fedorapeople.org/groups/katello/fakerepos/zoo${i}/`);
        await page.getByRole('button', { name: 'Save changes', exact: true }).click();
        await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      });
    }
  });

  await test.step('Verify the snapshot count for the repo.', async () => {
    const row = await getRowByNameOrUrl(page, repoName);
    await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
    await page.getByRole('button', { name: 'Kebab toggle' }).click();
    await page.getByRole('menuitem', { name: 'View all snapshots' }).click();
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    // Count the number of rows in the snapshot list table
    const snapshotCount = (await page.getByTestId('snapshot_list_table').locator('tr').count()) - 1; // Subtract 1 for the header row
    // Create a template which uses the repo and assert that is uses the latest snapshot
    await page.getByLabel('Close', { exact: true }).click();
    await navigateToTemplates(page);
    await page.getByRole('button', { name: 'Add content template' }).click();
    await page.getByRole('button', { name: 'Select architecture' }).click();
    await page.getByRole('option', { name: 'aarch64' }).click();
    await page.getByRole('button', { name: 'Select version' }).click();
    await page.getByRole('option', { name: 'el9' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await row.getByRole('gridcell', { name: 'Select row' }).locator('label').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await page.getByText('Use latest contentAlways use').click();
    await page.getByRole('radio', { name: 'Use latest content' }).check();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByPlaceholder('Enter name').fill(`${templateName}`);
    await page.getByPlaceholder('Description').fill('Template test');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Create other options' }).click();
    await page.getByText('Create template only', { exact: true }).click();
    const templateRow = await getRowByNameOrUrl(page, templateName);
    await expect(templateRow.getByText('Valid')).toBeVisible({ timeout: 60000 });
    // Verify the template is created and uses the latest snapshot
    await expect(
      await page.getByRole('gridcell', { name: 'Use latest' }).first().textContent(),
    ).toBe('Use latest');
    // Assert that the template snapshot count matches the repo snapshot count
    expect(snapshotCount).toBe(4);
//     // Test deletion of a single snapshot.
//     await test.step('Delete a single snapshot', async () => {
//       await navigateToRepositories(page);
//       const row = await getRowByNameOrUrl(page, repoName);
//       await row.getByLabel('Kebab toggle').click();
//       await page.getByRole('menuitem', { name: 'View all snapshots' }).click();
//       await expect(page.getByLabel('SnapshotsView list of').locator('tbody')).toBeVisible();
//       await page
//         .getByTestId('snapshot_list_table')
//         .locator('tbody tr')
//         .first()
//         .getByLabel('Kebab toggle')
//         .click();
//       //   await row.getByLabel('Kebab toggle').first().click();
//       await row.getByRole('menuitem', { name: 'Delete' }).click();
//       await expect(page.getByText('Remove repositories?')).toBeVisible();
//       await Promise.all([
//         page.waitForResponse(
//           (resp) =>
//             resp.url().includes('bulk_delete') && resp.status() >= 200 && resp.status() < 300,
//         ),
//         page.getByRole('button', { name: 'Remove' }).click(),
//       ]);
//       await expect(templateRow).not.toBeVisible();
//     });
//     // Test bulk deletion of multiple snapshots.
//   });
//   await deleteAllRepos(page, `&search=${repoNamePrefix}`);
// });
