import { test, expect } from '@playwright/test';
import { navigateToTemplates } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/helpers';

test.describe('Templates', () => {
  test('Navigate to templates, make sure the Add content template button can be clicked', async ({
    page,
  }) => {
    await navigateToTemplates(page);
    await closePopupsIfExist(page);
    await page.getByRole('button', { name: 'Add content template' }).click();
    await page.getByRole('button', { name: 'Select architecture' }).click();
    await page.getByRole('option', { name: 'x86_64' }).click();
    await page.getByRole('button', { name: 'Select version' }).click();
    await page.getByRole('option', { name: 'el8' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    // Add the step to select 'Red hat repos Checkbox'
    await page.getByRole('button', { name: 'Next' }).click();
    // Add the step to select 'checkbox for cutom repo'
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('input[name="use-latest-snapshot"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    const nameInput = page.getByPlaceholder('Enter name');
    // const descriptionInput = page.getByPlaceholder('Enter Description');
    await nameInput.fill('demo_template');
    // await descriptionInput.fill('test');
    await page.getByRole('button', { name: 'Next' }).click();
    // Add steps to create teamplate with system if you want to
    await page.locator('button.pf-v5-c-menu-toggle__button').click();
    await page.getByRole('option', { name: 'Create template only' }).click();
    await expect(page.getByText('Content Template "demo_template" created')).toBeVisible();
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
