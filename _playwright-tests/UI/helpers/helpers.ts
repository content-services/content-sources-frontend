import type { Page } from '@playwright/test';

export const closePopupsIfExist = async (page: Page) => {
  const locatorsToCheck = [
    page.locator('.pf-v5-c-alert.notification-item button'), // This closes all toast pop-ups
    page.locator(`button[id^="pendo-close-guide-"]`), // This closes the pendo guide pop-up
    page.locator(`button[id="truste-consent-button"]`), // This closes the trusted consent pup-up
    page.getByLabel('close-notification'), // This closes a one off info notification (May be covered by the toast above, needs recheck.)
  ];

  for (const locator of locatorsToCheck) {
    await page.addLocatorHandler(locator, async () => {
      await locator.click();
    });
  }
};
