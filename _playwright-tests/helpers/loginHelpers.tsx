import { expect, type Page } from '@playwright/test';
import path from 'path';

// This file can only contain functions that are referenced by authentication.

export const logout = async (page: Page, username: string) => {
  const menuButton = page.getByRole('button', { name: username });

  // Ensure the button is visible and enabled
  await expect(menuButton).toBeVisible({ timeout: 5000 });
  await expect(menuButton).toBeEnabled({ timeout: 5000 });

  // Click the button to open the menu
  await menuButton.click();

  // Locate and click the logout menu item
  const logoutMenuItem = page.getByRole('menuitem', { name: 'Log out' });
  await expect(logoutMenuItem).toBeVisible({ timeout: 10000 });
  await expect(logoutMenuItem).toBeEnabled({ timeout: 5000 });
  await logoutMenuItem.click();

  // Wait for navigation and verify login page
  await page.waitForURL((url) => !url.pathname.includes('/insights/content/repositories'), {
    timeout: 10000,
  });
  await expect(page.getByText('Log in to your Red Hat account')).toBeVisible({
    timeout: 10000,
  });
};

export const logInWithUsernameAndPassword = async (
  page: Page,
  username?: string,
  password?: string,
) => {
  if (!username || !password) {
    throw new Error('Username or password not found');
  }

  await page.goto('/insights/content/repositories');

  await expect(async () =>
    expect(page.getByText('Log in to your Red Hat account')).toBeVisible(),
  ).toPass();

  const login = page.getByRole('textbox');
  await login.fill(username);
  await login.press('Enter');
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.fill(password);
  await passwordField.press('Enter');

  await expect(async () => {
    expect(page.url()).toBe(`${process.env.BASE_URL}/insights/content/repositories`);
  }).toPass();
};

export const logInWithUser1 = async (page: Page) =>
  await logInWithUsernameAndPassword(page, process.env.USER1USERNAME, process.env.USER1PASSWORD);

export const storeStorageStateAndToken = async (page: Page) => {
  const { cookies } = await page
    .context()
    .storageState({ path: path.join(__dirname, '../../.auth/user.json') });
  process.env.TOKEN = `Bearer ${cookies.find((cookie) => cookie.name === 'cs_jwt')?.value}`;
  await page.waitForTimeout(100);
};

export const throwIfMissingEnvVariables = () => {
  const ManditoryEnvVariables = ['USER1USERNAME', 'USER1PASSWORD', 'BASE_URL'];

  const missing: string[] = [];
  ManditoryEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error('Missing env variables:' + missing.join(','));
  }
};
