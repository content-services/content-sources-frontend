import { expect, test as setup, type Page } from "@playwright/test";
import {
  closePopupsIfExist,
} from './UI/helpers/helpers';
import {
 throwIfMissingEnvVariables,
 logInWithUsernameAndPassword,
 storeStorageStateAndToken,
 logout,
} from "./helpers/loginHelpers";

setup.describe('Setup', async () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingEnvVariables()).not.toThrow();
  });

  setup('Authenticate', async ({ page }) => {
    setup.setTimeout(60_000);

    await closePopupsIfExist(page);
    await logInWithUsernameAndPassword(
      page, 
      process.env.USER1USERNAME,
      process.env.USER1PASSWORD,
    );
    // Save admin user storage state
    await page.context().storageState({ path: '.auth/default_user.json' });
    await logout(page);
    await logInWithUsernameAndPassword(
      page,
      process.env.RO_USER_USERNAME,
      process.env.RO_USER_PASSWORD,
    );
    // Save read-only user storage state
    await page.context().storageState({ path: '.auth/readonly_user.json' });
    await logout(page);
    // Example of how to add another user
    // await logout(page)
    // await logInWithUsernameAndPassword(
    //     page,
    //     process.env.USER2USERNAME,
    //     process.env.USER2PASSWORD
    // );
    // Example of how to switch to said user
    // await switchToUser(page, process.env.USER1USERNAME!);
    // await ensureNotInPreview(page);
    // Other users for other tests can be added below after logging out
  });
});
