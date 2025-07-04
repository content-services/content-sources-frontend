import { test, expect } from '@playwright/test';
import { RHSMClient } from './helpers/rhsmClient';
import { deleteAllTemplates } from '../UI/helpers/deleteTemplates';
import { navigateToRepositories, navigateToTemplates } from '../UI/helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from '../UI/helpers/helpers';
import { randomName } from '../UI/helpers/repoHelpers';

const templateNamePrefix = 'integration_test_template';
const templateName = `${templateNamePrefix}-${randomName()}`;
const client = new RHSMClient('RHSMClientTest');
let firstVersion;

test.describe('Test System With Template', async () => {
  test('Test System With Template', async ({ page }) => {
    await test.step('Delete any templates that exist', async () => {
      await deleteAllTemplates(page, `&search=${templateNamePrefix}`);
      await navigateToRepositories(page);
      await closePopupsIfExist(page);
    });
    await test.step('Navigate to templates, ensure the Add content template button can be clicked', async () => {
      await navigateToTemplates(page);
      await expect(page.getByRole('button', { name: 'Add content template' })).toBeVisible();
    });
    await test.step('Create a template with oldest snapshots', async () => {
      await page.getByRole('button', { name: 'Add content template' }).click();
      await page.getByRole('button', { name: 'filter arch' }).click();
      await page.getByRole('menuitem', { name: 'x86_64' }).click();
      await page.getByRole('button', { name: 'filter version' }).click();
      await page.getByRole('menuitem', { name: 'el9' }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Additional Red Hat repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Custom repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByText('Use up to specific date', { exact: true }).click();
      await page.getByPlaceholder('YYYY-MM-DD', { exact: true }).fill('2021-05-17'); // Older than any snapshot date
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByText('add template modal', { exact: true });
      await page.getByPlaceholder('Enter name').fill(`${templateName}`);
      await page.getByPlaceholder('Description').fill('Template test');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Create other options' }).click();
      await page.getByText('Create template only', { exact: true }).click();
      const rowTemplate = await getRowByNameOrUrl(page, `${templateName}`);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Create RHSM client and register the template', async () => {
      // Start the rhel9 container
      await client.Boot('rhel9');

      // Register, overriding the default key and org
      const reg = await client.RegisterRHC(
        process.env.ACTIVATION_KEY_1,
        process.env.ORG_ID_1,
        templateName,
      );
      if (reg?.exitCode != 0) {
        console.log(reg?.stdout);
        console.log(reg?.stderr);
      }
      expect(reg?.exitCode).toBe(0);

      // refresh subscription-manager
      const subManRefresh = await client.Exec(['subscription-manager', 'refresh', '--force']);
      expect(subManRefresh?.exitCode).toBe(0);

      // clean cached metadata
      const dnfCleanAll = await client.Exec(['dnf', 'clean', 'all']);
      expect(dnfCleanAll?.exitCode).toBe(0);

      // List errata the system is vulnerable to
      const exist = await client.Exec(
        ['sh', '-c', 'dnf updateinfo --list --all | grep RH | sort | tail -n 1'],
        10 * 60 * 1000,
      );
      if (exist?.exitCode != 0) {
        console.log(exist?.stdout);
        console.log(exist?.stderr);
      }
      expect(exist?.exitCode).toBe(0);
      firstVersion = exist?.stdout?.toString();
    });

    await test.step('Update the template date to latest', async () => {
      const rowTemplate = await getRowByNameOrUrl(page, templateName);
      await rowTemplate.getByRole('button', { name: templateName }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);
      await page.getByRole('button', { name: 'Actions' }).click();
      await page.getByRole('menuitem', { name: 'Edit' }).click();
      await expect(
        page.getByRole('heading', { name: 'Define template content', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Additional Red Hat repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Custom repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByText('Use latest content', { exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Enter template details')).toBeVisible();
      await expect(page.getByPlaceholder('Enter name')).toHaveValue(`${templateName}`);
      await expect(page.getByPlaceholder('Description')).toHaveValue('Template test');
      await page.getByPlaceholder('Description').fill('Template test edited');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm changes', exact: true }).click();
    });

    await test.step('Update system', async () => {
      // refresh subscription-manager
      const subManRefresh = await client.Exec(['subscription-manager', 'refresh', '--force']);
      expect(subManRefresh?.exitCode).toBe(0);

      // clean cached metadata
      const dnfCleanAll = await client.Exec(['dnf', 'clean', 'all']);
      expect(dnfCleanAll?.exitCode).toBe(0);

      // List errata the system is vulnerable to
      const updateInfo = await client.Exec(
        ['sh', '-c', 'dnf updateinfo --list --all | grep RH | sort | tail -n 1'],
        10 * 60 * 1000,
      );
      if (updateInfo?.exitCode != 0) {
        console.log(updateInfo?.stdout);
        console.log(updateInfo?.stderr);
      }
      expect(updateInfo?.exitCode).toBe(0);
      const secondVersion = updateInfo?.stdout?.toString();
      expect(secondVersion).not.toBe(firstVersion);

      // vim-enhanced shouldn't be installed
      const notExist = await client.Exec(['rpm', '-q', 'vim-enhanced']);
      expect(notExist?.exitCode).not.toBe(0);

      // Install vim-enhanced, expect it to finish in 60 seconds
      const yumInstall = await client.Exec(['yum', 'install', '-y', 'vim-enhanced'], 60000);
      expect(yumInstall?.exitCode).toBe(0);

      // Now vim-enhanced should be installed
      const exist = await client.Exec(['rpm', '-q', 'vim-enhanced']);
      expect(exist?.exitCode).toBe(0);
    });

    await test.step('Remove system', async () => {
      await client.Destroy(true);
    });

    await test.step('Delete the template', async () => {
      const rowTemplate = await getRowByNameOrUrl(page, `${templateName}`);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 60000 });
      await rowTemplate.getByLabel('Kebab toggle').click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(page.getByText('Remove template?')).toBeVisible();
      await page.getByRole('button', { name: 'Remove' }).click();
      await expect(rowTemplate.getByText('Valid')).not.toBeVisible();
      await deleteAllTemplates(page, `&search=${templateNamePrefix}`);
    });
  });
});
