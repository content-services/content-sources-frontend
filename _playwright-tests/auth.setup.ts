import { expect, test as setup } from '@playwright/test';
import {
  ensureNotInPreview,
  storeStorageStateAndToken,
  throwIfMissingEnvVariables,
  logout,
  logInWithReadOnlyUser,
  logInWithAdminUser,
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
    await logInWithReadOnlyUser(page);

    // Save state for read-only user
    await storeStorageStateAndToken(page, 'read-only.json');
    await logout(page);
  });

  setup('Authenticate Default User and Save State', async ({ page }) => {
    setup.setTimeout(60_000);

    // Login default admin user
    await logInWithAdminUser(page);
    await ensureNotInPreview(page);

    // Save state for default admin user
    await storeStorageStateAndToken(page, 'admin_user.json');
  });
});
