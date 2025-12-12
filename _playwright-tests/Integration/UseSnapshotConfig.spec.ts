import { closeGenericPopupsIfExist, getRowByNameOrUrl } from '../UI/helpers/helpers';
import { navigateToRepositories } from '../UI/helpers/navHelpers';
import { cleanupRepositories, randomName, test, expect, TemplatesApi } from 'test-utils';
import { createCustomRepo } from '../UI/helpers/createRepositories';
import { RHSMClient, refreshSubscriptionManager, waitForRhcdActive } from './helpers/rhsmClient';
import fs from 'fs';
import { runCmd } from './helpers/helpers';

const repoNamePrefix = 'Snapshot_Config';

test.describe('Use Snapshot Config', () => {
  test('Use Snapshot Config', async ({ page, client, cleanup }) => {
    let repoName = '';
    let configContent = '';
    let repo_uuid = '';

    const regClient = new RHSMClient(`snapshot_config_test_${randomName()}`);
    const templatePrefix = 'Test-template-CRUD';
    const template_name = `${templatePrefix}-${randomName()}`;
    repoName = `${repoNamePrefix}_${randomName()}`;

    await test.step('Set up cleanup for repositories and templates', async () => {
      await cleanup.runAndAdd(() => cleanupRepositories(client, repoNamePrefix));
      await cleanup.runAndAdd(() => regClient.Destroy('rhc'));
    });

    await test.step('Verify "download config file" and "copy to clipboard config" content has same value', async () => {
      await navigateToRepositories(page);
      await closeGenericPopupsIfExist(page);
      repo_uuid = await createCustomRepo(page, repoName);

      // Reload to ensure newly created repo is visible
      await page.reload();
      await closeGenericPopupsIfExist(page);
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid', { exact: true })).toBeVisible({ timeout: 60000 });
      await row.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'View all snapshots' }).click();
      await expect(page.getByRole('dialog', { name: 'Snapshots' })).toBeVisible();

      // Grant clipboard permissions to the page
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      // Use button + label attribute selector for icon-only buttons
      const copy_to_clipboard_button = page
        .locator('button[label="repo_config_file_copy_button"]')
        .first();
      await expect(copy_to_clipboard_button).toBeVisible();
      await copy_to_clipboard_button.click();

      // Wait for async copy operation to complete (fetches data then writes to clipboard)
      await expect
        .poll(async () => page.evaluate(() => navigator.clipboard.readText()), {
          message: 'Waiting for clipboard to have content',
          timeout: 30000,
        })
        .toBeTruthy();
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

      const download_button = page
        .locator('button[label="repo_config_file_download_button"]')
        .first();
      const [download] = await Promise.all([
        page.waitForEvent('download'), // Wait for the download event
        download_button.click(),
      ]);
      const path = await download.path();
      if (!path) {
        throw new Error('Download failed or path is invalid');
      }
      const fileContent = fs.readFileSync(path, 'utf-8');

      expect(fileContent.trim()).toEqual(clipboardText.trim());

      // Save config content for use in later steps
      configContent = fileContent.trim();

      // close the modal - use the footer Close button (not the X button)
      const modal = page.getByRole('dialog', { name: 'Snapshots' });
      await modal.getByRole('button', { name: 'Close', exact: true }).last().click();
    });

    await test.step('Create a Template', async () => {
      const templatesApi = new TemplatesApi(client);
      const template = await templatesApi.createTemplate({
        apiTemplateRequest: {
          name: template_name,
          arch: 'aarch64',
          repositoryUuids: [repo_uuid],
          version: '9',
          useLatest: true,
        },
      });
      expect(template.name).toContain(templatePrefix);
    });

    await test.step('Use snapshot config on a registered system', async () => {
      await regClient.Boot('rhel9');

      const reg = await regClient.RegisterRHC(
        process.env.ACTIVATION_KEY_1,
        process.env.ORG_ID_1,
        template_name,
      );
      if (reg?.exitCode != 0) {
        console.log('Registration stdout:', reg?.stdout);
        console.log('Registration stderr:', reg?.stderr);
      }
      expect(reg?.exitCode, 'registration should be successful').toBe(0);

      await waitForRhcdActive(regClient);

      await refreshSubscriptionManager(regClient);
      await runCmd('Clean cached metadata', ['dnf', 'clean', 'all'], regClient);

      const repolist = await runCmd(
        'Verify repository is listed',
        ['dnf', 'repolist', '-v'],
        regClient,
      );
      console.log(repolist?.stdout?.toString());
      expect(repolist?.stdout?.toString().trim()).toContain(repoName);

      // Extract baseurl from downloaded config content
      const configBaseUrlLine = configContent
        .split('\n')
        .find((line) => line.startsWith('baseurl='));
      const config_baseurl = configBaseUrlLine?.replace('baseurl=', '').trim() || '';
      console.log('Config baseurl:', config_baseurl);

      // config_baseurl should present in repolist response
      expect(repolist?.stdout?.toString().trim()).toContain(config_baseurl);
    });
  });
});
