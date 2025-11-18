
import { test, expect } from 'test-utils';
import { navigateToDashboard } from './helpers/navHelpersPatch';

const getNumber = (txt: string) => txt.match(/\d+/)?.[0] || '';

test.describe('Dashboard Patch', () => {
  test('Validate Patch counts with Dashboard cards', async ({ page }) => {

    await navigateToDashboard(page);

    const patchCard = page.locator('#insd-c-dashboard__card--PatchManager');

    const securityCount = getNumber(
      await patchCard.getByRole('link', { name: /Security advisories/i }).innerText()
    );

    const bugFixCount = getNumber(
      await patchCard.getByRole('link', { name: /Bug fixes/i }).innerText()
    );

    const enhancementCount = getNumber(
      await patchCard.getByRole('link', { name: /Enhancements/i }).innerText()
    );

    const systemsAffected = getNumber(
      await patchCard.getByRole('link', { name: /system(s)? affected/i }).innerText()
    );

    await page.getByRole('link', { name: /Security advisories/i }).click();
    await expect(page.locator('#options-menu-top-toggle')).toContainText(securityCount);

    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: /Bug fixes/i }).click();
    await expect(page.locator('#options-menu-top-toggle')).toContainText(bugFixCount);

    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: /Enhancements/i }).click();
    await expect(page.locator('#options-menu-top-toggle')).toContainText(enhancementCount);

    await page.getByRole('link', { name: 'Dashboard' }).click();

    await page.getByRole('link', { name: /system(s)? affected/i }).click();
    await expect(
      page.getByTestId('inventory-table-top-toolbar').getByLabel('Items per page')
    ).toContainText(systemsAffected);
 
    
  });
});
