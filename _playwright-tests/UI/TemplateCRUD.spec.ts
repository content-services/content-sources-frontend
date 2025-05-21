import { test, expect } from '@playwright/test';
import { navigateToRepositories, navigateToTemplates } from './helpers/navHelpers';
import { closePopupsIfExist, getRowByNameOrUrl } from './helpers/helpers';
import { deleteAllTemplates } from './helpers/deleteTemplates';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { createCustomRepo } from './helpers/createRepositories';

import { randomName } from './helpers/repoHelpers';

const templateNamePrefix = 'template_CRUD';
const repoNamePrefix = 'custom_repo-template';

const repoName = `${repoNamePrefix}-${randomName()}`;
const templateName = `${templateNamePrefix}-${randomName()}`;

const smallRHRepo = 'Red Hat CodeReady Linux Builder for RHEL 9 ARM 64 (RPMs)';

test.describe('Templates CRUD', () => {
  test('Add, Read, update, delete a template', async ({ page }) => {
    await test.step('Delete any templates and template test repos that exist', async () => {
      await deleteAllRepos(page, `&search=${repoNamePrefix}`);
      await deleteAllTemplates(page, `&search=${templateNamePrefix}`);
      await navigateToRepositories(page);
      await closePopupsIfExist(page);
    });
    await test.step('Create a repository', async () => {
      await createCustomRepo(page, repoName);
      const row = await getRowByNameOrUrl(page, repoName);
      await expect(row.getByText('Valid')).toBeVisible({ timeout: 60_000 });
    });
    await test.step('Navigate to templates, ensure the Add content template button can be clicked', async () => {
      await navigateToTemplates(page);
      await expect(page.getByRole('button', { name: 'Add content template' })).toBeVisible();
    });
    await test.step('Create a template', async () => {
      await page.getByRole('button', { name: 'Add content template' }).click();
      await page.getByRole('button', { name: 'filter arch' }).click();
      await page.getByTestId('filter_aarch64').click();
      await page.getByRole('button', { name: 'filter version' }).click();
      await page.getByTestId('filter_9').click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      const modalPage = page.getByTestId('add_template_modal');
      const rowRHELRepo = await getRowByNameOrUrl(modalPage, smallRHRepo);
      await rowRHELRepo.getByLabel('Select row').click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await modalPage.getByRole('searchbox', { name: 'Filter by name/url' }).fill(repoName);
      const rowRepo = await getRowByNameOrUrl(modalPage, repoName);
      await rowRepo.getByLabel('Select row').click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByText('Use latest content', { exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByText('add template modal', { exact: true });
      await page.getByPlaceholder('Enter name').fill(`${templateName}`);
      await page.getByPlaceholder('Description').fill('Template test');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Create other options' }).click();
      await page.getByText('Create template only', { exact: true }).click();
    });
    await test.step('Read and update values in the template', async () => {
      const rowTemplate = await getRowByNameOrUrl(page, templateName);
      await rowTemplate.getByRole('button', { name: templateName }).click();
      await expect(page.getByLabel('Breadcrumb').first()).toHaveText('RHELContentTemplates');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(templateName);
      await expect(page.getByText('Description:Template test')).toBeVisible();
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
      await expect(page.getByText(`${repoName}`)).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Set up date', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Enter template details')).toBeVisible();
      await expect(page.getByPlaceholder('Enter name')).toHaveValue(`${templateName}`);
      await expect(page.getByPlaceholder('Description')).toHaveValue('Template test');
      await page.getByPlaceholder('Enter name').fill(`${templateName}-edited`);
      await page.getByPlaceholder('Description').fill('Template test edited');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm changes', exact: true }).click();
    });
    await test.step('Delete the template', async () => {
      const rowTemplate = await getRowByNameOrUrl(page, `${templateName}-edited`);
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
