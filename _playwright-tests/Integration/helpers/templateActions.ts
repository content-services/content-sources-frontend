import { Page } from '@playwright/test';
import { expect } from 'test-utils';
import { RHSMClient, OSVersion } from './rhsmClient';
import { RELEASE_STREAMS } from '../../testConstants';

/**
 * Creates a template via the UI creation modal.
 *
 * This helper automates the multistep template creation flow:
 * 1. Selects OS version and architecture
 * 2. Skips Red Hat and custom repository selection
 * 3. Sets snapshot configuration to "latest content"
 * 4. Fills in the template name and description
 * 5. Either creates template only or opens system assignment modal
 *
 * **Important:** This helper does NOT handle:
 * - Navigation to the templates page (call `navigateToTemplates()` first)
 * - Closing popups/modals (call `closeGenericPopupsIfExist()` first)
 * - Waiting for template validation (call `waitForValidStatus()` after)
 *
 * @param page - Playwright page object
 * @param templateName - Unique name for the template
 * @param templateDescription - Optional description (default: 'Template creation test')
 * @param osVersion - OS version to select (e.g., '9' or '9.6') (default: '9')
 * @param arch - CPU architecture to select (default: 'x86_64')
 * @param stream - Extended support stream (eus/e4s/eeus). If omitted, template uses Standard stream
 * @param withSystemAssignment - If true, opens the system assignment modal instead of creating template only (default: false)
 */
export const createTemplateViaUI = async ({
  page,
  templateName,
  templateDescription = 'Template creation test',
  osVersion = '9',
  arch = 'x86_64',
  stream,
  withSystemAssignment = false,
}: {
  page: Page;
  templateName: string;
  templateDescription?: string;
  osVersion?: string;
  arch?: string;
  stream?: 'eus' | 'e4s' | 'eeus';
  withSystemAssignment?: boolean;
}) => {
  const nextButton = page.getByRole('button', { name: 'Next', exact: true });

  await page.getByRole('button', { name: 'Create template' }).click();

  // Select an extended support stream if specified
  if (stream) {
    await page.getByRole('button', { name: 'Release stream toggle' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.getByRole('menuitem', { name: RELEASE_STREAMS[stream] }).click();
  }

  await page.getByRole('button', { name: 'filter OS version' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: `RHEL ${osVersion}` }).click();

  await page.getByRole('button', { name: 'filter architecture' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: arch }).click();
  await nextButton.click();

  await expect(
    page.getByRole('heading', { name: 'Additional Red Hat repositories', exact: true }),
  ).toBeVisible();
  await nextButton.click();

  await expect(
    page.getByRole('heading', { name: 'Other repositories', exact: true }),
  ).toBeVisible();
  await nextButton.click();

  await page.getByRole('radio', { name: 'Use the latest content' }).check();
  await nextButton.click();

  await expect(page.getByText('Enter template details')).toBeVisible();
  await page.getByPlaceholder('Enter name').fill(templateName);
  await page.getByPlaceholder('Description').fill(templateDescription);
  await nextButton.click();

  if (withSystemAssignment) {
    await page.getByRole('button', { name: 'Create template and add to systems' }).click();
  } else {
    await page.getByRole('button', { name: 'Create other options' }).click();
    await page.getByText('Create template only', { exact: true }).click();
  }
};

/**
 * Boots a system container and registers it with a template using Red Hat Connector (RHC).
 *
 * This high-level helper orchestrates the complete system setup flow:
 * 1. Boots a RHEL container with the specified OS version
 * 2. Retrieves the system's hostname
 * 3. Registers the system with RHC using the provided activation key and org ID
 * 4. Assigns the system to the specified template during registration
 * 5. Asserts that registration succeeded (exitCode === 0)
 *
 * **Note:** This helper contains assertions and will fail the test if registration fails.
 *
 * @param regClient - RHSM client instance (manages the container lifecycle)
 * @param templateName - Template name to assign the system to during registration
 * @param osVersion - OS version to boot (default: 'rhel9')
 * @param activationKey - Red Hat activation key for registration (default: process.env.ACTIVATION_KEY_1)
 * @param orgId - Red Hat organization ID (default: process.env.ORG_ID_1)
 * @returns The hostname of the booted and registered system
 */
export const setupSystemWithTemplate = async ({
  regClient,
  templateName,
  osVersion = 'rhel9',
  activationKey = process.env.ACTIVATION_KEY_1,
  orgId = process.env.ORG_ID_1,
}: {
  regClient: RHSMClient;
  templateName: string;
  osVersion?: OSVersion;
  activationKey?: string;
  orgId?: string;
}) => {
  await regClient.Boot(osVersion);
  const hostname = await regClient.GetHostname();

  const registration = await regClient.RegisterRHC(activationKey, orgId, templateName);

  if (registration?.exitCode !== 0) {
    console.error('Registration failed:', {
      exitCode: registration?.exitCode,
      stdout: registration?.stdout,
      stderr: registration?.stderr,
    });
  }

  expect(registration?.exitCode, 'registration should be successful').toBe(0);

  return hostname;
};
