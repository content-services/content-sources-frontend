import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';

export const repoNamePrefix = 'GPG-key';
export const randomName = () => (Math.random() + 1).toString(36).substring(2, 6);
export const repoName = `${repoNamePrefix}-${randomName()}`;

export const url = 'https://jlsherrill.fedorapeople.org/fake-repos/signed/';
export const packages_key =
  'http://jlsherrill.fedorapeople.org/fake-repos/needed-errata/RPM-GPG-KEY-dummy-packages-generator';
export const meta_key = 'https://jlsherrill.fedorapeople.org/fake-repos/signed/GPG-KEY.gpg';

test.describe('Test GPG keys', () => {
  test('Create a repo, add a GPG Key, toggle metadata', async ({ page }) => {
    await test.step('Delete any GPG key test repos that exist', async () => {
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
      // Paste the URL to the packages GPG key
      await page.getByPlaceholder('Paste GPG key or URL here').fill(packages_key);
      expect(page.getByRole('textbox', { name: 'gpgkey_file_to_upload' })).toContainText(
        '-----BEGIN PGP PUBLIC KEY BLOCK-----',
      );
      // Check that validate fails if you select the metadata option
      await page.getByText('Package and metadata').click();
      await expect(page.getByText('Error validating signature:')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
      await page.getByText('Package verification only').click();
      // Save button would be disabled for bad or incorrect gpg key
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    });
    await test.step('Change to Metadata GPG Key', async () => {
      // Search for the created repo
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
      // Open edit modal
      await row.getByLabel('Kebab toggle').click();
      // Click on the Edit button to see the repo
      await row.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(page.getByRole('dialog', { name: 'Edit custom repository' })).toBeVisible();
      // Paste the URL to the repo metadata GPG key
      await page.getByPlaceholder('Paste GPG key or URL here').fill(meta_key);
      expect(page.getByRole('textbox', { name: 'gpgkey_file_to_upload' })).toContainText(
        '-----BEGIN PGP PUBLIC KEY BLOCK-----',
      );
      await page.getByText('Package and metadata').click();
      // Save button would be disabled for bad or incorrect gpg key
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    });
  });
});
