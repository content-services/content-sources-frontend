import { test, expect, cleanupTemplates, randomName } from 'test-utils';
import { refreshSubscriptionManager, RHSMClient } from '../Integration/helpers/rhsmClient';
import { runCmd } from '../Integration/helpers/helpers';
import { navigateToTemplates } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';

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
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    const HARepo = 'Red Hat Enterprise Linux 9 for x86_64 - High Availability';

    await test.step('Set up cleanup for repositories, templates, and RHSM client', async () => {
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));
      cleanup.add(() => regClient.Destroy('rhc'));
    });

    await closePopupsIfExist(page);

    await test.step('Create template', async () => {
      await navigateToTemplates(page);
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
      await page.getByRole('button', { name: 'Create other options' }).click();
      await page.getByText('Create template only', { exact: true }).click();
      const rowTemplate = await getRowByNameOrUrl(page, templateName);
      await expect(rowTemplate.getByText('Valid')).toBeVisible({ timeout: 660000 });
    });

    await test.step('Boot and register RHSM client', async () => {
      await regClient.Boot('rhel9');
      const hostnameResult = await runCmd('Get hostname', ['hostname'], regClient);
      hostname = hostnameResult?.stdout?.toString().trim() || '';
      console.log('Container hostname:', hostname);

      const reg = await regClient.RegisterRHC(process.env.ACTIVATION_KEY_1, process.env.ORG_ID_1);
      if (reg?.exitCode != 0) {
        console.log('Registration stdout:', reg?.stdout);
        console.log('Registration stderr:', reg?.stderr);
      }
      expect(reg?.exitCode, 'Expect registering to be successful').toBe(0);
    });

    await test.step('Assign template to systems', async () => {
      await navigateToTemplates(page);
      await expect(page.getByRole('button', { name: templateName })).toBeVisible();
      await page.getByRole('button', { name: templateName }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);
      // remove this later once we have the systems tab UI change merge
      // https://github.com/content-services/content-sources-frontend/pull/757
      await page.getByRole('tab', { name: 'Systems' }).click();
      await expect(page.getByRole('button', { name: 'Assign to systems' })).toBeVisible({
        timeout: 30000,
      });
      await page.getByRole('button', { name: 'Assign to systems' }).click();
      const modalPage = page.getByRole('dialog', { name: 'Assign template to systems' });
      await expect(modalPage).toBeVisible({ timeout: 30000 });
      await expect(modalPage.getByRole('button', { name: 'Assign', exact: true })).toBeDisabled({
        timeout: 30000,
      });
      const rowSystem = await getRowByNameOrUrl(modalPage, hostname);
      await rowSystem.getByLabel('Select row').click();

      await expect(modalPage.getByRole('button', { name: 'Assign', exact: true })).toBeEnabled({
        timeout: 30000,
      });
      await modalPage.getByRole('button', { name: 'Assign', exact: true }).click();
      await expect(modalPage).toBeHidden({ timeout: 30000 });

      await expect(page.getByRole('tab', { name: 'Systems' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      const systemsTablePage = page.getByRole('grid', { name: 'assign systems table' });
      const row_systemsTable = await getRowByNameOrUrl(systemsTablePage, hostname);
      await expect(row_systemsTable).toBeVisible({ timeout: 30000 });
    });

    await test.step('Verify the host can install packages from the template', async () => {
      await refreshSubscriptionManager(regClient);
      await runCmd('Clean cached metadata', ['dnf', 'clean', 'all'], regClient);
      await runCmd(
        'vim-enhanced should not be installed',
        ['rpm', '-q', 'vim-enhanced'],
        regClient,
        60000,
        1,
      );

      await runCmd(
        'Install vim-enhanced',
        ['yum', 'install', '-y', 'vim-enhanced'],
        regClient,
        60000,
      );

      await runCmd('vim-enhanced should be installed', ['rpm', '-q', 'vim-enhanced'], regClient);

      const dnfVerifyRepo = await runCmd(
        'Verify that vim-enhanced was installed from the template',
        ['sh', '-c', "dnf info vim-enhanced | grep '^From repo' | cut -d ':' -f2-"],
        regClient,
      );
      expect(dnfVerifyRepo?.stdout?.toString().trim()).toBe('rhel-9-for-x86_64-appstream-rpms');
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
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    await test.step('Create template', async () => {
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateName));
      cleanup.add(() => regClient.Destroy('rhc'));

      await closePopupsIfExist(page);
      await navigateToTemplates(page);

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
      await page.getByRole('button', { name: 'Create template and add to systems' }).click();
    });

    await test.step('Boot and register RHSM client', async () => {
      await regClient.Boot('rhel9');
      const hostnameResult = await runCmd('Get hostname', ['hostname'], regClient);
      hostname = hostnameResult?.stdout?.toString().trim() || '';
      console.log('Container hostname:', hostname);
      const reg = await regClient.RegisterRHC(process.env.ACTIVATION_KEY_1, process.env.ORG_ID_1);
      if (reg?.exitCode != 0) {
        console.log('Registration stdout:', reg?.stdout);
        console.log('Registration stderr:', reg?.stderr);
      }
      expect(reg?.exitCode, 'Expect registering to be successful').toBe(0);
      await refreshSubscriptionManager(regClient);
      await runCmd('Clean cached metadata', ['dnf', 'clean', 'all'], regClient);
    });

    await test.step('Assign template to systems', async () => {
      await expect(page.getByText('Assign template to systems')).toBeVisible({ timeout: 30000 });
      const modalPage = page.getByRole('dialog', { name: 'Assign template to systems' });
      await expect(modalPage).toBeVisible({ timeout: 30000 });
      const rowSystem = await getRowByNameOrUrl(modalPage, hostname);
      await expect(modalPage.getByRole('button', { name: 'Assign', exact: true })).toBeDisabled({
        timeout: 30000,
      });
      await rowSystem.getByLabel('Select row').click();
      await expect(modalPage.getByRole('button', { name: 'Assign', exact: true })).toBeEnabled({
        timeout: 30000,
      });
      await modalPage.getByRole('button', { name: 'Assign', exact: true }).click();
      await expect(modalPage).toBeHidden({ timeout: 30000 });
      const systemRow = await getRowByNameOrUrl(page, hostname);
      // remove this after merging the systems tab UI change
      // https://github.com/content-services/content-sources-frontend/pull/757
      await expect(page.getByRole('tab', { name: 'Systems' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(systemRow).toBeVisible({ timeout: 30000 });
    });

    await test.step('Verify the host can install packages from the template', async () => {
      await runCmd(
        'vim-enhanced should not be installed initially',
        ['rpm', '-q', 'vim-enhanced'],
        regClient,
        60000,
        1,
      );

      await refreshSubscriptionManager(regClient);
      await runCmd('Clean cached metadata', ['dnf', 'clean', 'all'], regClient);

      await runCmd(
        'Install vim-enhanced from template',
        ['yum', 'install', '-y', 'vim-enhanced'],
        regClient,
        60000,
      );
      await runCmd('Verify vim-enhanced is installed', ['rpm', '-q', 'vim-enhanced'], regClient);
      const dnfVerifyRepo = await runCmd(
        'Verify that vim-enhanced was installed from the template',
        ['sh', '-c', "dnf info vim-enhanced | grep '^From repo' | cut -d ':' -f2-"],
        regClient,
      );
      expect(dnfVerifyRepo?.stdout?.toString().trim()).toBe('rhel-9-for-x86_64-appstream-rpms');
    });
  });
});
