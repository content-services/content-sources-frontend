import { test } from '@playwright/test';
import { navigateToTemplates } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/helpers';

test.describe('Templates', () => {
  test('Navigate to templates, make sure the Add content template button can be clicked', async ({
    page,
  }) => {
    await navigateToTemplates(page);
    await closePopupsIfExist(page);
    await page.getByRole('button', { name: 'Add content template' }).click();
    const architectureFilterButton = page.getByRole('button', { name: 'Select architecture' });
    await architectureFilterButton.click()
    await page.getByRole('option', { name: 'x86_64' }).click();
    const versionFilterButton = page.getByRole('button', { name: 'Select version' });
    await versionFilterButton.click();
    await page.getByRole('menuitem', { name: 'el8' }).locator('label').click();
    await page.getByRole('button', { name: 'Next' }).click();
    // select Red hat repos Checkbox optional
    await page.getByRole('button', { name: 'Next' }).click();
    // select checkbox for cutom repo optional
    page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('radio', { name: 'use-latest-snapshot' }).fill('True');
    page.getByRole('button', { name: 'Next' }).click();
    const nameInput = page.getByPlaceholder('Enter name');
    const descriptionInput = page.getByPlaceholder('Enter Description'); //optional
    await nameInput.fill('demo_template');
    await descriptionInput.fill('test'); // optional
    page.getByRole('button', { name: 'Next' }).click();
    // teamplate with system
    page.getByRole('button').locator('pf-v5-c-menu-toggle__button');
    page.getByRole('button', { name: 'Create template only' }).click();
  });
});
