import {
  test,
  expect,
  cleanupTemplates,
  ensureValidToken,
  randomName,
  waitInPatch,
} from 'test-utils';
import {
  LONG_TEST_TIMEOUT_MS,
  RHSM_RHCD_WAIT,
  SYSTEM_ATTACHMENT_VISIBILITY_TIMEOUT_MS,
} from '../testConstants';
import { navigateToTemplates } from '../UI/helpers/navHelpers';
import {
  closeGenericPopupsIfExist,
  getRowByNameOrUrl,
  waitForValidStatus,
} from '../UI/helpers/helpers';
import { RHSMClient, waitForRhcdActive, refreshSubscriptionManager } from './helpers/rhsmClient';
import { createTemplateViaUI, setupSystemWithTemplate } from './helpers/templateActions';
import { createApiConfigWithDynamicToken } from './helpers/apiHelpers';

const templateNamePrefix = 'use_template_dialog_test';
const regClient = new RHSMClient(`RHSMClientTest-${randomName()}`);

test.describe('Register and assign template to systems via API', () => {
  test('Create template and assign to systems via API', async ({ page, client, cleanup }) => {
    void client; // Pull in fixture so Undici fetch dispatcher is configured for dynamic API cleanup
    test.setTimeout(LONG_TEST_TIMEOUT_MS);

    const templateName = `${templateNamePrefix}-${randomName()}`;

    await test.step('Set up cleanup for repositories, templates, and RHSM client', async () => {
      await cleanup.runAndAdd(async () => {
        await ensureValidToken(page, 'ADMIN_TOKEN.json', 5);
        const apiBasePath = process.env.BASE_URL + '/api/content-sources/v1';
        const cleanupClient = createApiConfigWithDynamicToken('ADMIN_TOKEN', apiBasePath);
        await cleanupTemplates(cleanupClient, templateNamePrefix);
      });
      cleanup.add(() => regClient.Destroy('rhc'));
    });

    await closeGenericPopupsIfExist(page);

    await test.step('Create template via UI', async () => {
      await navigateToTemplates(page);

      await createTemplateViaUI({
        page,
        templateName,
        templateDescription: 'Template for use template dialog test',
      });

      await waitForValidStatus(page, templateName);
    });

    const modalPage = page.getByRole('dialog').filter({ hasText: 'Assign template to systems' });

    await test.step('Navigate to template details and open dialog', async () => {
      const row = await getRowByNameOrUrl(page, templateName);
      await row.getByRole('button', { name: templateName }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);
      await page.getByRole('link', { name: 'Register and assign via API' }).click();
      await expect(modalPage).toBeVisible();
    });

    let rhcConnectCmd: string;

    await test.step('assign template to system with "Register and assign via API" button', async () => {
      await expect(
        modalPage.getByRole('button', { name: 'Register and assign via API' }),
      ).toBeVisible();
      rhcConnectCmd = await modalPage.locator('input[value*="rhc connect"]').inputValue();

      await modalPage.getByRole('button', { name: 'Close' }).first().click();
      await expect(modalPage).toBeHidden();
    });

    await test.step('Boot RHEL container and run commands', async () => {
      // Extract template ID from the rhc connect command
      const templateMatch = rhcConnectCmd.match(/--content-template[=\s]+"?([^"\s]+)"?/);
      const templateId = templateMatch ? templateMatch[1] : undefined;

      if (!templateId) {
        throw new Error(`Could not extract template ID from command: ${rhcConnectCmd}`);
      }

      await setupSystemWithTemplate({
        regClient,
        templateName: templateId,
      });

      await waitForRhcdActive(regClient, RHSM_RHCD_WAIT.maxAttempts, RHSM_RHCD_WAIT.delayMs);
      await refreshSubscriptionManager(regClient);
    });

    await test.step('Verify system is attached to template', async () => {
      const hostname = await regClient.GetHostname();

      await waitInPatch(page, hostname, true);

      // Check if system row is visible with an extended timeout
      const systemRow = page.getByRole('row').filter({ hasText: hostname });
      await expect(systemRow).toBeVisible({
        timeout: SYSTEM_ATTACHMENT_VISIBILITY_TIMEOUT_MS,
      });
    });
  });
});
