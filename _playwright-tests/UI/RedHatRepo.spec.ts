import { test, expect } from 'test-utils';
import { navigateToRepositories, navigateToSnapshotsOfRepository } from './helpers/navHelpers';
import { closeGenericPopupsIfExist, waitForValidStatus } from './helpers/helpers';

test.describe('Red Hat Repositories', () => {
  const appstreamRHRepoName = 'Red Hat Enterprise Linux 10 for ARM 64 - AppStream (RPMs)';

  test.beforeEach(async ({ page }) => {
    await test.step('Navigate to repositories page', async () => {
      await navigateToRepositories(page);
      await closeGenericPopupsIfExist(page);
    });

    await test.step('Navigate to Red Hat repositories', async () => {
      await page.getByRole('button', { name: 'Red Hat', exact: true }).click();
    });
  });

  test('Verify snapshotting of Red Hat repositories', async ({ page }) => {
    await test.step('Wait for status to be "Valid"', async () => {
      await waitForValidStatus(page, appstreamRHRepoName, 210_000);
    });

    await test.step('Check repository snapshots', async () => {
      const row = page.getByRole('row').filter({ hasText: appstreamRHRepoName });
      await navigateToSnapshotsOfRepository(page, row);
      await expect(
        page.getByTestId('snapshot_list_modal').filter({ hasText: appstreamRHRepoName }),
      ).toBeVisible();
    });

    await test.step('Close the snapshots list modal', async () => {
      // Using testId here because the modal has 2 close buttons
      await page.getByTestId('snapshot_list_modal-ModalBoxCloseButton').click();
    });
  });
});
