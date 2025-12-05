import { test, expect, cleanupTemplates, randomName } from 'test-utils';
import { navigateToTemplates } from '../UI/helpers/navHelpers';
import { closeGenericPopupsIfExist, getRowByNameOrUrl } from '../UI/helpers/helpers';
import { RHSMClient } from './helpers/rhsmClient';
import { runCmd } from './helpers/helpers';

const templateNamePrefix = 'use_template_dialog_test';
const regClient = new RHSMClient(`RHSMClientTest-${randomName()}`);

test.describe('Use template dialog', () => {
  test('Create template and verify use template options', async ({ page, client, cleanup }) => {
    const templateName = `${templateNamePrefix}-${randomName()}`;

    await test.step('Set up cleanup for repositories, templates, and RHSM client', async () => {
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));
      cleanup.add(() => regClient.Destroy('rhc'));
    });

    await closeGenericPopupsIfExist(page);

    await test.step('Create template via UI', async () => {
      await navigateToTemplates(page);
      page.getByRole('button', { name: 'Create template' }).click();

      await page.getByRole('button', { name: 'filter architecture' }).click();
      await page.getByRole('menuitem', { name: 'x86_64' }).click();
      await page.getByRole('button', { name: 'filter OS version' }).click();
      await page.getByRole('menuitem', { name: 'el9' }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: 'Additional Red Hat repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: 'Other repositories', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await page.getByText('Use the latest content', { exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await expect(page.getByText('Enter template details')).toBeVisible();
      await page.getByPlaceholder('Enter name').fill(templateName);
      await page.getByPlaceholder('Description').fill('Template for use template dialog test');
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      await page.getByRole('button', { name: 'Create other options' }).click();
      await page.getByText('Create template only', { exact: true }).click();

      const rowTemplate = await getRowByNameOrUrl(page, templateName);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Navigate to template details and open Use template dialog', async () => {
      await page.getByRole('button', { name: templateName }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);
      await page.getByRole('button', { name: 'use-template-button' }).click();
    });

    const modalPage = page.getByRole('dialog', { name: 'Use template' });

    let rhcConnectCmd: string;
    let curlCmd: string;
    let refreshCmd: string;

    await test.step('Fetch commands from Red Hat Lightspeed tab', async () => {
      await expect(modalPage).toBeVisible();
      await expect(modalPage.getByRole('tab', { name: 'insights-tab' })).toBeVisible();

      const rhcConnectSection = modalPage.locator('li').filter({ hasText: 'Register with rhc' });
      rhcConnectCmd = await rhcConnectSection.getByLabel('Copyable input').first().inputValue();

      const curlSection = modalPage
        .locator('li')
        .filter({ hasText: 'Or add the template via the API' });
      curlCmd = await curlSection.getByLabel('Copyable input').first().inputValue();

      const refreshInput = modalPage.locator('input[value*="subscription-manager"]').first();
      refreshCmd = await refreshInput.inputValue();
      expect(refreshCmd).toContain('subscription-manager refresh');
    });

    await test.step('Boot RHEL container and run commands', async () => {
      await regClient.Boot('rhel9');

      const username = process.env.ADMIN_USERNAME;
      const password = process.env.ADMIN_PASSWORD;
      await runCmd(
        'Run RHC connect command',
        ['sh', '-c', `${rhcConnectCmd} -u '${username}' -p '${password}'`],
        regClient,
        120000,
      );

      await runCmd('Run curl command to assign template', ['sh', '-c', curlCmd], regClient, 120000);
      await runCmd(
        'Run subscription-manager refresh command',
        ['sh', '-c', refreshCmd],
        regClient,
        120000,
      );
    });

    await test.step('Verify system is attached to template', async () => {
      await modalPage.locator('button.pf-m-secondary').filter({ hasText: 'Close' }).click();
      await expect(modalPage).toBeHidden();
      await page.getByRole('tab', { name: 'Systems' }).click();
      const hostname = await regClient.GetHostname();
      const systemRow = await getRowByNameOrUrl(page, hostname!);
      await expect(systemRow).toBeVisible({ timeout: 60000 });
    });
  });

  test('Verify use template dialog is working as expected', async ({
    page,
    client,
    cleanup,
  }) => {});
});
