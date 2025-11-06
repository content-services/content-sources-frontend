import path from 'path';
import { test, expect, cleanupRepositories, cleanupTemplates, randomName } from 'test-utils';
import { RHSMClient, refreshSubscriptionManager } from './helpers/rhsmClient';
import { runCmd } from './helpers/helpers';
import { navigateToRepositories, navigateToTemplates } from '../UI/helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl, retry } from '../UI/helpers/helpers';

const uploadRepoName = 'Upload_Repo';
test.describe('Install Upload Repositories on Host', () => {
  test('Install Upload Repositories on Host', async ({ page, client, cleanup }) => {
    await cleanup.runAndAdd(() => cleanupRepositories(client, uploadRepoName));
    await closePopupsIfExist(page);
    await navigateToRepositories(page);

    let regClient: RHSMClient;
    let templateName: string;
    let hostname: string;
    const uploadRepo = uploadRepoName;

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
      const versionFilterButton = page.getByRole('button', { name: 'filter OS version' });
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
          { timeout: 600000 },
        ),
      ]);

      // Handle the file chooser and upload the file
      const filePath = path.join(__dirname, '../UI/fixtures/bear-4.1-1.noarch.rpm');

      await retry(page, async (page) => {
        const fileInput = page.locator('input[type=file]').first();
        await fileInput.setInputFiles(filePath);
      });

      // Verify the upload completion message
      await expect(page.getByText('All uploads completed!')).toBeVisible({ timeout: 60000 });

      // Confirm changes
      await page.getByRole('button', { name: 'Confirm changes' }).click();

      // There might be many rows at this point, we need to ensure that we filter the repo
      const row = await getRowByNameOrUrl(page, uploadRepoName);
      // Verify the 'Valid' status
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 660000 });
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
      // skipping red hat repositories step since we are using upload repository
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Other repositories', exact: true }),
      ).toBeVisible();
      // filter by upload repository name
      await page.getByRole('searchbox', { name: 'Filter by name' }).fill(uploadRepo);
      const rowUploadRepo = await getRowByNameOrUrl(page, uploadRepo);
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

    // await test.step('Verify system appears in template systems list', async () => {
    //   // Navigate to the template details page
    //   await navigateToTemplates(page);

    //   // Search/filter for the template by name to ensure it's visible
    //   await page.getByRole('searchbox', { name: 'Filter by name' }).fill(templateName);
    //   const templateRow = await getRowByNameOrUrl(page, templateName);
    //   await templateRow.getByLabel('Select row').click();

    //   // Navigate to Systems tab
    //   await page.getByRole('tab', { name: 'Systems' }).click();
    //   await expect(page.getByRole('tab', { name: 'Systems', selected: true })).toBeVisible();

    //   // Wait for and verify the registered system appears in the list
    // });

    await test.step('Install from the template and verify the upload repository is installed', async () => {
      // verify the bear package is not installed
      await runCmd(
        'bear package should not be installed',
        ['rpm', '-q', 'bear'],
        regClient,
        60000,
        1,
      );

      // install the bear package
      await runCmd('Install bear package', ['yum', 'install', '-y', 'bear'], regClient, 60000);

      // verify the bear package is installed
      await runCmd('bear package should be installed', ['rpm', '-q', 'bear'], regClient);

      // verify the bear package is installed from the upload repository by dnf info
      const dnfVerifyRepo = await runCmd(
        'Verify that bear was installed from the upload repo',
        ['sh', '-c', "dnf info bear | grep '^From repo' | cut -d ':' -f2-"],
        regClient,
      );
      expect(dnfVerifyRepo?.stdout?.toString().trim()).toBe(uploadRepo);
    });
  });
});
