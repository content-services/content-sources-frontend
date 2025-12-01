import { test, expect, cleanupTemplates, randomName } from 'test-utils';
import { refreshSubscriptionManager, RHSMClient } from './helpers/rhsmClient';
import { runCmd } from './helpers/helpers';
import { navigateToTemplates } from '../UI/helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from '../UI/helpers/helpers';
import { Page } from '@playwright/test';

/**
 * Boot RHSM client and register with RHC
 */
async function bootAndRegisterClient(
  regClient: RHSMClient,
  activationKey: string | undefined,
  orgId: string | undefined,
): Promise<string> {
  await regClient.Boot('rhel9');
  const hostnameResult = await runCmd('Get hostname', ['hostname'], regClient);
  const hostname = hostnameResult?.stdout?.toString().trim() || '';
  console.log('Container hostname:', hostname);

  const reg = await regClient.RegisterRHC(activationKey, orgId);
  if (reg?.exitCode != 0) {
    console.log('Registration stdout:', reg?.stdout);
    console.log('Registration stderr:', reg?.stderr);
  }
  expect(reg?.exitCode, 'Expect registering to be successful').toBe(0);

  return hostname;
}

/**
 * Verify package download URL is from base CDN (not template)
 */
async function verifyPackageUrlFromBaseCDN(regClient: RHSMClient): Promise<void> {
  const packageUrl = await runCmd(
    'Get download URL for vim-enhanced from base CDN',
    ['dnf', 'repoquery', '--location', 'vim-enhanced'],
    regClient,
    60000,
  );
  console.log('Package download URL from base CDN:', packageUrl?.stdout);
  expect(
    packageUrl?.stdout,
    'Package download URL should be from base CDN, not template',
  ).not.toContain('/templates/');
}

/**
 * Verify package download URL is from template (not base CDN)
 */
async function verifyPackageUrlFromTemplate(regClient: RHSMClient): Promise<void> {
  const packageUrl = await runCmd(
    'Get download URL for vim-enhanced from template',
    ['dnf', 'repoquery', '--location', 'vim-enhanced'],
    regClient,
    120000,
  );
  console.log('Package download URL from template:', packageUrl?.stdout);
  expect(
    packageUrl?.stdout,
    'Package download URL should be from template, not base CDN',
  ).toContain('/templates/');
}

/**
 * Verify that packages are installed from the template repo (URL contains /templates/)
 */
async function verifyPackageInstalledFromTemplate(regClient: RHSMClient): Promise<void> {
  await refreshSubscriptionManager(regClient);
  await runCmd('Clean cached metadata', ['dnf', 'clean', 'all'], regClient);

  await runCmd(
    'vim-enhanced should not be installed',
    ['rpm', '-q', 'vim-enhanced'],
    regClient,
    60000,
    1,
  );

  await verifyPackageUrlFromTemplate(regClient);

  await runCmd('Install vim-enhanced', ['yum', 'install', '-y', 'vim-enhanced'], regClient, 60000);

  await runCmd('vim-enhanced should be installed', ['rpm', '-q', 'vim-enhanced'], regClient);
}

/**
 * Fill out template creation wizard up to the details page
 */
async function fillTemplateWizard(page: Page, templateName: string): Promise<void> {
  const nextButton = page.getByRole('button', { name: 'Next', exact: true });

  await expect(page.getByRole('button', { name: 'Create template' })).toBeVisible();
  await page.getByRole('button', { name: 'Create template' }).click();
  await page.getByRole('button', { name: 'filter architecture' }).click();
  await page.getByRole('menuitem', { name: 'x86_64' }).click();
  await page.getByRole('button', { name: 'filter OS version' }).click();
  await page.getByRole('menuitem', { name: 'el9' }).click();
  await nextButton.click();

  await expect(
    page.getByRole('heading', { name: 'Additional Red Hat repositories', exact: true }),
  ).toBeVisible();
  await nextButton.click();

  await expect(
    page.getByRole('heading', { name: 'Other repositories', exact: true }),
  ).toBeVisible();
  await nextButton.click();

  await page.getByText('Use the latest content', { exact: true }).click();
  await nextButton.click();

  await expect(page.getByText('Enter template details')).toBeVisible();
  await page.getByPlaceholder('Enter name').fill(templateName);
  await page.getByPlaceholder('Description').fill('Test template for system assignment');
  await nextButton.click();
}

/**
 * Select a system in the "Assign template to systems" modal and assign it
 */
async function assignSystemInModal(page: Page, hostname: string): Promise<void> {
  const modalPage = page.getByRole('dialog', { name: 'Assign template to systems' });
  await expect(modalPage).toBeVisible({ timeout: 30000 });

  await expect(modalPage.getByRole('button', { name: 'Assign', exact: true })).toBeDisabled({
    timeout: 30000,
  });

  const rowSystem = await getRowByNameOrUrl(modalPage, hostname);
  await rowSystem.getByRole('checkbox').click();

  await expect(modalPage.getByRole('button', { name: 'Assign', exact: true })).toBeEnabled({
    timeout: 30000,
  });
  await modalPage.getByRole('button', { name: 'Assign', exact: true }).click();
  await expect(modalPage).toBeHidden({ timeout: 30000 });
}

test.describe('Assign Template to System via UI', () => {
  const templateNamePrefix = 'Template_test_for_system_assignment';

  test('Create template and assign to system using "Assign to systems" button', async ({
    page,
    client,
    cleanup,
  }) => {
    const templateName = `${templateNamePrefix}-${randomName()}`;
    const containerName = `RHSMClientTest-${randomName()}`;
    const regClient = new RHSMClient(containerName);
    let hostname = '';

    await test.step('Set up cleanup for repositories, templates, and RHSM client', async () => {
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));
      cleanup.add(() => regClient.Destroy('rhc'));
    });

    await closePopupsIfExist(page);

    await test.step('Create template', async () => {
      await navigateToTemplates(page);
      await fillTemplateWizard(page, templateName);
      await page.getByRole('button', { name: 'Create other options' }).click();
      await page.getByText('Create template only', { exact: true }).click();
      const rowTemplate = await getRowByNameOrUrl(page, templateName);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 60000 });
    });

    await test.step('Boot and register RHSM client', async () => {
      hostname = await bootAndRegisterClient(
        regClient,
        process.env.ACTIVATION_KEY_1,
        process.env.ORG_ID_1,
      );
      await verifyPackageUrlFromBaseCDN(regClient);
    });

    await test.step('Assign template to systems', async () => {
      await navigateToTemplates(page);
      await expect(page.getByRole('button', { name: templateName })).toBeVisible();
      await page.getByRole('button', { name: templateName }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);

      // TODO: remove this later once we have the systems tab UI change merge
      // https://github.com/content-services/content-sources-frontend/pull/757
      await page.getByRole('tab', { name: 'Systems' }).click();
      await expect(page.getByRole('button', { name: 'Assign to systems' })).toBeVisible({
        timeout: 30000,
      });
      await page.getByRole('button', { name: 'Assign to systems' }).click();

      await assignSystemInModal(page, hostname);

      await expect(page.getByRole('tab', { name: 'Systems' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      const systemsTablePage = page.getByRole('grid', { name: 'assign systems table' });
      const row_systemsTable = await getRowByNameOrUrl(systemsTablePage, hostname);
      await expect(row_systemsTable).toBeVisible({ timeout: 30000 });
    });

    await test.step('Verify the host can install packages from the template', async () => {
      await verifyPackageInstalledFromTemplate(regClient);
    });
  });

  test('Create template and assign to system using "Create template and add to systems" button', async ({
    page,
    client,
    cleanup,
  }) => {
    const templateName = `${templateNamePrefix}-${randomName()}`;
    const containerName = `RHSMClientTest-${randomName()}`;
    const regClient = new RHSMClient(containerName);
    let hostname = '';

    await test.step('Create template', async () => {
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateName));
      cleanup.add(() => regClient.Destroy('rhc'));

      await closePopupsIfExist(page);
      await navigateToTemplates(page);
      await fillTemplateWizard(page, templateName);
      await page.getByRole('button', { name: 'Create template and add to systems' }).click();
    });

    await test.step('Boot and register RHSM client', async () => {
      hostname = await bootAndRegisterClient(
        regClient,
        process.env.ACTIVATION_KEY_1,
        process.env.ORG_ID_1,
      );
      await verifyPackageUrlFromBaseCDN(regClient);
    });

    await test.step('Assign template to systems', async () => {
      await expect(page.getByText('Assign template to systems')).toBeVisible({ timeout: 30000 });

      await assignSystemInModal(page, hostname);

      const systemRow = await getRowByNameOrUrl(page, hostname);
      // TODO: remove this after merging the systems tab UI change
      // https://github.com/content-services/content-sources-frontend/pull/757
      await expect(page.getByRole('tab', { name: 'Systems' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(systemRow).toBeVisible({ timeout: 30000 });
    });

    await test.step('Verify the host can install packages from the template', async () => {
      await verifyPackageInstalledFromTemplate(regClient);
    });
  });
});
