import { expect, test as setup } from '@playwright/test';
import {
  ensureNotInPreview,
  logInWithUser1,
  storeStorageStateAndToken,
  throwIfMissingEnvVariables,
  logInWithUsernameAndPassword,
  logout,
} from './helpers/loginHelpers';
import { closePopupsIfExist } from './UI/helpers/helpers';

import { existsSync, mkdirSync } from 'fs';
const authDir = '.auth';
if (!existsSync(authDir)) {
  mkdirSync(authDir);
}

setup.describe('Setup Authentication States', async () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingEnvVariables()).not.toThrow();
  });

  setup('Authenticate Read-Only User and Save State', async ({ page }) => {
    setup.setTimeout(60_000);

    await closePopupsIfExist(page);

    // Login read-only user
    await logInWithUsernameAndPassword(
      page,
      process.env.READONLY_USERNAME!,
      process.env.READONLY_PASSWORD!,
    );

    // Save state for read-only user
    await storeStorageStateAndToken(page, 'contentPlaywrightReader.json');

    // Verify successful login?
    // await expect(page.locator('text=Logged in as read-only user')).toBeVisible({ timeout: 10000 }); // Adjust based on your UI
  });

  setup('Authenticate Default User and Save State', async ({ page }) => {
    setup.setTimeout(60_000);

    // Login default user (assuming logInWithUser1 performs a full login)
    await logInWithUser1(page);
    await ensureNotInPreview(page);

    // Save state for default user
    await storeStorageStateAndToken(page, 'default_user.json');

    // Verify successful login?
    // await expect(page.locator('text=Logged in as default user')).toBeVisible({ timeout: 10000 }); // Adjust based on your UI
  });
});
