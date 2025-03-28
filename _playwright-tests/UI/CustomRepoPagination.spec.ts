import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { deleteAllRepos } from './helpers/deleteRepositories';
import { bulkCreateRepos } from './helpers/createRepositories';
import { closePopupsIfExist } from './helpers/helpers';

const repoNamePrefix = 'custom_repo-pagination';

test.describe('Custom repositories pagination', () => {
  test('Test pagination on custom repo page', async ({ page }) => {
    await test.step('Delete any pagination test repos that exist', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await deleteAllRepos(page, `&search=${repoNamePrefix}`);
    });
    await test.step('Populate the custom repo table', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await bulkCreateRepos(page, 11); // 12 counting from 0
      await page.waitForTimeout(500); // Try avoid API rate limit
      await navigateToRepositories(page);
      await page.waitForTimeout(500); // Try avoid API rate limit
      await closePopupsIfExist(page);
      await page.waitForTimeout(500); // Try avoid API rate limit
      await page.getByPlaceholder(/^Filter by name.*$/).fill(repoNamePrefix);
    });
    await test.step('Set pagination to 10 using top paginator', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await expect(page.locator('button#topPaginationWidgetId-top-toggle')).toHaveText(
        '1 - 12 of 12',
      );
      await page.click('button#topPaginationWidgetId-top-toggle');
      await page.waitForTimeout(500); // Try avoid API rate limit
      await page.getByRole('menuitem', { name: '10 per page' }).click();
    });
    await test.step('Assert there are only ten repos displayed', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await expect(page.locator('button#topPaginationWidgetId-top-toggle')).toHaveText(
        '1 - 10 of 12',
      );
    });
    await test.step('Move to second page and assert only two repos are displayed', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await page.getByLabel('Go to next page').first().click();
      await expect(page.locator('button#topPaginationWidgetId-top-toggle')).toHaveText(
        '11 - 12 of 12',
      );
    });
    await test.step('Move back to first page and assert only two repos are displayed', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await page.getByLabel('Go to previous page').first().click();
      await expect(page.locator('button#topPaginationWidgetId-top-toggle')).toHaveText(
        '1 - 10 of 12',
      );
    });
    await test.step('Post test cleanup', async () => {
      await page.waitForTimeout(500); // Try avoid API rate limit
      await deleteAllRepos(page, `&search=${repoNamePrefix}`);
    });
  });
});
