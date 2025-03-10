import { Page, Locator, expect } from '@playwright/test';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

export const snapshotTimestampFormat = 'DD MMM YYYY - HH:mm:ss';

export const closePopupsIfExist = async (page: Page) => {
  const locatorsToCheck = [
    page.locator('.pf-v5-c-alert.notification-item button'), // This closes all toast pop-ups
    page.locator(`button[id^="pendo-close-guide-"]`), // This closes the pendo guide pop-up
    page.locator(`button[id="truste-consent-button"]`), // This closes the trusted consent pop-up
    page.getByLabel('close-notification'), // This closes a one off info notification (May be covered by the toast above, needs recheck.)
  ];

  for (const locator of locatorsToCheck) {
    await page.addLocatorHandler(locator, async () => {
      await locator.first().click(); // There can be multiple toast pop-ups
    });
  }
};
export const filterByNameOrUrl = async (page: Page, name: string) => {
  await page.getByPlaceholder(/^Filter by name.*$/).fill(name);
};

export const clearFilters = async (page: Page) => {
  try {
    await page.getByRole('button', { name: 'Clear filters' }).waitFor({ timeout: 5000 });
  } catch {
    return;
  }

  await page.getByRole('button', { name: 'Clear filters' }).click();
};

export const getRowByNameOrUrl = async (page: Page, filterValue: string) => {
  await clearFilters(page);
  await filterByNameOrUrl(page, filterValue);
  return page.getByRole('row').filter({ has: page.getByText(filterValue) });
};

export const getRowCellByHeader = async (page: Page, row: Locator, name: string) => {
  await expect(page.getByRole('columnheader', { name: name })).toBeVisible()
  const table = row.locator('xpath=ancestor::*[@role="grid" or @role="table"][1]');
  const headers = table.getByRole('columnheader');
  const headerCount = await headers.count();

  let index = -1;
  for (let i = 0; i < headerCount; i++) {
    let headerContent = (await headers.nth(i).textContent()) || '';
    headerContent = headerContent.trim();

    if (headerContent.includes(name)) {
      index = i;
      break;
    }
  }

  if (index == -1) {
    throw new Error(`Header "${name}" not found in the table/grid.`);
  }

  return row.getByRole('gridcell').nth(index);
};

export const validateSnapshotTimestamp = async (timestamp: string, howRecent: number) => {
  /**
   * Checks whether the Snaphot timestamp is recent to validate if the Snapshot was created successfully
   * @param timestamp - Snapshot timestamp in string format
   * @param howRecent - How recent the timestamp should be in minutes
   * @returns true if the timestamp is less recent than howRecent, false otherwise
   */
  dayjs.extend(customParseFormat);
  const formattedTimestamp = dayjs(timestamp, snapshotTimestampFormat);
  const currentTime = dayjs();
  // Compare the timestamp difference to current time in minutes
  const difference = formattedTimestamp.diff(currentTime, 'minute');
  if (difference > howRecent) {
    return false;
  }
  return true;
};
