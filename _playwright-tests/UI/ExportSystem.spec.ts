import { test, expect } from 'test-utils';
import { navigateToSystems } from './helpers/navHelpersPatch';

test('EXPORT', async ({ page }) => {
  await navigateToSystems(page);

  await page.getByRole('button', { name: 'Export' }).click();
  await page.getByRole('menuitem', { name: 'Export to CSV' }).click();

  const preparingAlert = page.locator('div.pf-v5-c-alert.pf-m-info.notification-item');
  const successAlert = page.locator('div.pf-v5-c-alert.pf-m-success');

  await expect(preparingAlert).toBeVisible({ timeout: 10_000 });
  await expect(preparingAlert).toContainText(/preparing|export/i);

  await expect(successAlert).toBeVisible({ timeout: 30_000 });
  await successAlert.getByRole('button', { name: /close/i }).click();

  await page.getByRole('button', { name: 'Export' }).click();
  await page.getByRole('menuitem', { name: 'Export to JSON' }).click();

  // ------- Verify “Downloading” success alert -------
  await expect(successAlert).toBeVisible({ timeout: 30_000 });
});
