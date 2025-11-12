import path from 'path';
import { test, expect, cleanupRepositories, cleanupTemplates, randomName } from 'test-utils';
import { RHSMClient, refreshSubscriptionManager } from './helpers/rhsmClient';
import { runCmd } from './helpers/helpers';
import { navigateToRepositories, navigateToTemplates } from '../UI/helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl, retry } from '../UI/helpers/helpers';

const uploadRepoNamePrefix = 'Upload_Repo';
test.describe('Install Upload Repositories on Host', () => {
  test('Install Upload Repositories on Host', async ({ page, client, cleanup }) => {
    await cleanup.runAndAdd(() => cleanupRepositories(client, uploadRepoNamePrefix));
    await closePopupsIfExist(page);
    await navigateToRepositories(page);

    let regClient: RHSMClient;
    let templateName: string;
    let hostname: string;
    const uploadRepoName = `${uploadRepoNamePrefix}-${randomName()}`;

    await test.step('Create upload repository', async () => {
      await page.getByRole('button', { name: 'Add repositories' }).first().click();
      await expect(page.locator('div[id^="pf-modal-part"]').first()).toBeVisible();
      const nameInput = page.getByPlaceholder('Enter name');
      await nameInput.click();
      await nameInput.fill(uploadRepoName);
      await page.getByLabel('Upload', { exact: true }).check();
      await page.getByRole('button', { name: 'filter architecture' }).click();
      await page.getByRole('menuitem', { name: 'x86_64' }).click();
      const versionFilterButton = page.getByRole('button', { name: 'filter OS version' });
      await versionFilterButton.click();
      await page.getByRole('menuitem', { name: 'el9' }).click();
      await versionFilterButton.click();
      await Promise.all([
        page.getByRole('button', { name: 'Save and upload content' }).click(),
        page.waitForResponse(
          (resp) =>
            resp.url().includes('/bulk_create/') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 600000 },
        ),
      ]);
      const filePath = path.join(__dirname, '../UI/fixtures/bear-4.1-1.noarch.rpm');
      await retry(page, async (page) => {
        const fileInput = page.locator('input[type=file]').first();
        await fileInput.setInputFiles(filePath);
      });
      await expect(page.getByText('All uploads completed!')).toBeVisible({ timeout: 60000 });
      await page.getByRole('button', { name: 'Confirm changes' }).click();
      const row = await getRowByNameOrUrl(page, uploadRepoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Navigate to templates, and create a template with the upload repository', async () => {
      const templateNamePrefix = 'integration_test_upload_repo';
      templateName = `${templateNamePrefix}-${randomName()}`;
      hostname = `RHSMClientTest-${randomName()}`;
      regClient = new RHSMClient(hostname);

      await test.step('Set up cleanup for templates and RHSM client', async () => {
        await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));
        cleanup.add(() => regClient.Destroy('rhc'));
      });

      await navigateToTemplates(page);
      await closePopupsIfExist(page);
      await expect(page.getByRole('button', { name: 'Create template' })).toBeVisible();
      await page.getByRole('button', { name: 'Create template' }).click();
      await page.getByRole('button', { name: 'filter architecture' }).click();
      await page.getByRole('menuitem', { name: 'x86_64' }).click();
      await page.getByRole('button', { name: 'filter OS version' }).click();
      await page.getByRole('menuitem', { name: 'el9' }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Other repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('searchbox', { name: 'Filter by name' }).fill(uploadRepoName);
      const rowUploadRepo = await getRowByNameOrUrl(page, uploadRepoName);
      await expect(rowUploadRepo.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await rowUploadRepo.getByLabel('Select row').click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByText('Use the latest content', { exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Enter template details')).toBeVisible();
      await page.getByPlaceholder('Enter name').fill(`${templateName}`);
      await page.getByPlaceholder('Description').fill('Template test for upload repository');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Create other options' }).click();
      await page.getByText('Create template only', { exact: true }).click();
      const rowTemplate = await getRowByNameOrUrl(page, `${templateName}`);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 660000 });
    });

    await test.step('Register system with template using RHSM client', async () => {
      await regClient.Boot('rhel9');

      const reg = await regClient.RegisterRHC(
        process.env.ACTIVATION_KEY_1,
        process.env.ORG_ID_1,
        templateName,
      );
      if (reg?.exitCode != 0) {
        console.log('Registration stdout:', reg?.stdout);
        console.log('Registration stderr:', reg?.stderr);
      }
      expect(reg?.exitCode).toBe(0);

      await refreshSubscriptionManager(regClient);
      await runCmd('Clean cached metadata', ['dnf', 'clean', 'all'], regClient);
    });

    await test.step('verify the upload repository content is installed', async () => {
      await runCmd(
        'bear package should not be installed',
        ['rpm', '-q', 'bear'],
        regClient,
        60000,
        1,
      );
      await runCmd('Install bear package', ['yum', 'install', '-y', 'bear'], regClient, 60000);
      await runCmd('bear package should be installed', ['rpm', '-q', 'bear'], regClient);
      const dnfVerifyRepo = await runCmd(
        'Verify that bear was installed from the upload repo',
        ['sh', '-c', "dnf info bear | grep '^From repo' | cut -d ':' -f2-"],
        regClient,
      );
      expect(dnfVerifyRepo?.stdout?.toString().trim()).toBe(uploadRepoName);
    });
  });
});
