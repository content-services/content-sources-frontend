import { test, expect } from '@playwright/test';
import { navigateToTemplates } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';
const smallRHRepo = 'Red Hat CodeReady Linux Builder for RHEL 9 ARM 64 (RPMs)';

test.describe('Templates', () => {
  test('Navigate to templates, make sure the Add content template button can be clicked', async ({
    page,
  }) => {
    await navigateToTemplates(page);
    await closePopupsIfExist(page);
    await page.getByRole('button', { name: 'Add content template' }).click();
    await page.getByRole('button', { name: 'Select architecture' }).click();
    await page.getByRole('option', { name: 'aarch64' }).click();
    await page.getByRole('button', { name: 'Select version' }).click();
    await page.getByRole('option', { name: 'el9' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    // Locate the checkbox in the table row and click it.
    const rowRHELRepo = await getRowByNameOrUrl(page, smallRHRepo);
    await rowRHELRepo.getByRole('checkbox', { name: 'Select row' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    // Select 'use latest content' radio button
    page.getByRole('radio', { name: 'Use latest content' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    // Populate the template with a name and description.
    await page.getByPlaceholder('Enter name').fill('demo_template2');
    await page.getByPlaceholder('Enter Description').fill('test');
    await page.getByRole('button', { name: 'Next' }).click();
    // Submit the template without a system. This step is optional, so it is being skipped.
    await page.getByText('Create template only', { exact: true }).click();
    await page.getByRole('option', { name: 'Create template only' }).click();
    // Check if the table contains the template with the name "demo_template"
    const table = page.locator('table');
    await expect(table).toContainText('demo_template');
  });

  test('Validate documentation link in empty state', async ({ page }) => {
    await test.step('Mock template list API to get to empty state', async () => {
      await page.route('**/api/content-sources/*/templates/**', async (route) => {
        const response = await route.fetch();
        const json = {
          data: [],
          links: {
            first: '/api/content-sources/v1.0/templates/?limit=20&offset=0',
            last: '/api/content-sources/v1.0/templates/?limit=20&offset=0',
          },
          meta: { count: 0, limit: 20, offset: 0 },
        };
        await route.fulfill({ response, json });
      });
    });

    await test.step('Navigate to the templates page', async () => {
      await navigateToTemplates(page);
      await closePopupsIfExist(page);
    });

    await test.step(`Click the 'Learn more about templates' link and verify the destination`, async () => {
      await page.getByRole('button', { name: 'Learn more about templates' }).click();
      expect(
        page.url().startsWith('https://docs.redhat.com/en/documentation/red_hat_insights/'),
      ).toBeTruthy();
      expect(page.url().includes('content-template')).toBeTruthy();
      await expect(page.getByText('Creating a content template').first()).toBeVisible();
      await expect(
        page.getByText('A content template is a set of repository snapshots').first(),
      ).toBeVisible();
    });
  });
});
