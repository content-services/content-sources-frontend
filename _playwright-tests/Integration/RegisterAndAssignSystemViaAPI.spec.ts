import { test, expect, cleanupTemplates, randomName } from 'test-utils';
import { navigateToTemplates } from '../UI/helpers/navHelpers';
import { closeGenericPopupsIfExist, getRowByNameOrUrl } from '../UI/helpers/helpers';
import { RHSMClient, waitForRhcdActive } from './helpers/rhsmClient';
import { runCmd } from './helpers/helpers';
import { pollForSystemTemplateAttachment } from './helpers/systemHelpers';

const templateNamePrefix = 'use_template_dialog_test';
const regClient = new RHSMClient(`RHSMClientTest-${randomName()}`);

test.describe('Register and assign template to systems via API', () => {
  test('Create template and assign to systems via API', async ({ page, client, cleanup }) => {
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

      // use helper waitForValidStatus() once #786 is merged
      const rowTemplate = await getRowByNameOrUrl(page, templateName);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Navigate to template details and open dialog', async () => {
      await page.getByRole('button', { name: templateName }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);
      // modal will open with "Register and assign via API" button selected
      page.getByRole('link', { name: 'Register and assign via API' }).click();
      await expect(
        page.getByRole('dialog').filter({ hasText: 'Assign template to systems' }),
      ).toBeVisible();
    });

    const modalPage = page.getByRole('dialog').filter({ hasText: 'Assign template to systems' });

    let refreshCmd: string;
    let rhcConnectCmd: string;

    await test.step('assign template to system with "Register and assign via API" button', async () => {
      // dropdown is already selected to "Register and assign via API"
      await expect(page.getByRole('dialog').locator('.pf-v6-c-menu-toggle__text')).toHaveText(
        'Register and assign via API',
      );
      await expect(modalPage).toBeVisible();
      rhcConnectCmd = await modalPage.locator('input[value*="rhc connect"]').first().inputValue();

      refreshCmd = await modalPage
        .locator('input[value*="subscription-manager"]')
        .first()
        .inputValue();

      // Close the modal after extracting commands (use footer button)
      await modalPage
        .locator('.pf-v6-c-modal-box__footer')
        .getByRole('button', { name: 'Close' })
        .click();
      await expect(modalPage).toBeHidden();
    });

    await test.step('Boot RHEL container and run commands', async () => {
      const username = process.env.ADMIN_USERNAME;
      const password = process.env.ADMIN_PASSWORD;

      await regClient.Boot('rhel9');

      // Configure for stage environment if not in production
      if (!process.env.PROD) {
        await regClient.ConfigureSubManForStage();
        await regClient.ConfigureRHCForStage();
      }

      await runCmd(
        'Run rhc connect command',
        ['sh', '-c', `${rhcConnectCmd} -u ${username} -p ${password}`],
        regClient,
        120000,
      );
      await runCmd(
        'Run subscription-manager refresh command',
        ['sh', '-c', refreshCmd],
        regClient,
        120000,
      );
      // registration should be successful
      await waitForRhcdActive(regClient);
    });

    await test.step('Verify system is attached to template', async () => {
      const hostname = await regClient.GetHostname();

      // Poll for system template attachment via API
      const isAttached = await pollForSystemTemplateAttachment(page, hostname, true, 10_000, 12);
      expect(isAttached, 'system should be attached to template').toBe(true);

      // Refresh page to get updated data, then verify system appears in UI
      await page.reload();
      await page.getByRole('tab', { name: 'Systems' }).click();
      await expect(page.getByRole('row').filter({ hasText: hostname })).toBeVisible({
        timeout: 30000,
      });
    });
  });
});
