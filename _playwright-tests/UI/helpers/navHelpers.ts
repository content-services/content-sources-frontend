import { type Page } from '@playwright/test';
import { retry } from './helpers';

const navigateToRepositoriesFunc = async (page: Page) => {
  await page.goto('/insights/content/repositories');

  const zeroState = page.locator(
    'div.pf-v5-l-grid__item.bannerBefore > div > div.pf-v5-u-pt-lg > h1',
  );

  const repositoriesListPage = page.getByText('View all repositories within your organization.');

  // Wait for either list page or zerostate
  await Promise.race([
    repositoriesListPage.waitFor({ state: 'visible' }),
    zeroState.waitFor({ state: 'visible' }),
  ]);

  if (await zeroState.isVisible()) {
    await page.getByRole('button', { name: 'Add repositories now' }).click();
  }
};

export const navigateToRepositories = async (page: Page) => {
  await retry(page, navigateToRepositoriesFunc);
};

const navigateToTemplatesFunc = async (page: Page) => {
  await page.goto('/insights/content/templates');

  const repositoriesListPage = page.getByText(
    'View all content templates within your organization.',
  );

  // Wait for either list page or zerostate
  await repositoriesListPage.waitFor({ state: 'visible' });
};

export const navigateToTemplates = async (page: Page) => {
  await retry(page, navigateToTemplatesFunc);
};
