import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';

// This file can only contain functions that are referenced by authentication.

export const logout = async (page: Page) => {
  await page
    .getByRole('button')
    .filter({ has: page.getByRole('img', { name: 'User Avatar' }) })
    .click();

  await expect(async () => page.getByRole('menuitem', { name: 'Log out' }).isVisible()).toPass();

  await page.getByRole('menuitem', { name: 'Log out' }).click();

  await expect(async () => {
    expect(page.url()).not.toBe('/insights/content/repositories');
  }).toPass();
  await expect(async () =>
    expect(page.getByText('Log in to your Red Hat account')).toBeVisible(),
  ).toPass();
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
  }).toPass({
    intervals: [1_000],
    timeout: 30_000,
  });
};

export const logInWithUser1 = async (page: Page) =>
  await logInWithUsernameAndPassword(page, process.env.USER1USERNAME, process.env.USER1PASSWORD);

export const storeStorageStateAndToken = async (page: Page, fileName: string) => {
  const filePath = path.join(__dirname, '../../.auth', fileName); // Construct full path
  console.log(`Saving storage state to: ${filePath}`); // Added for debugging

  const { cookies } = await page.context().storageState({ path: filePath });

  // Ensure process.env.TOKEN is only set if 'cs_jwt' cookie is found
  const csJwtCookie = cookies.find((cookie) => cookie.name === 'cs_jwt');
  if (csJwtCookie) {
    process.env.TOKEN = `Bearer ${csJwtCookie.value}`;
    console.log('JWT Token successfully set in process.env.TOKEN'); // Added for debugging
  } else {
    console.warn('Warning: cs_jwt cookie not found when storing storage state.');
    process.env.TOKEN = undefined; // Clear it if not found, to avoid stale tokens
  }

  await page.waitForTimeout(100);
};

export const logInWithReadOnlyUser = async (page: Page) =>
  await logInWithUsernameAndPassword(
    page,
    process.env.READONLYUSERNAME,
    process.env.READONLYPASSWORD,
  );

export const getUserAuthToken = (name: string) => {
  const userPath = path.join(__dirname, `../../.auth/${name}.json`);
  const fileContent = readFileSync(userPath, { encoding: 'utf8' });

  const regex = /"name":\s*"cs_jwt",\s*"value":\s*"(.*?)"/;

  const match = fileContent.match(regex);
  if (match && match[1]) {
    return `Bearer ${match[1]}`;
  }

  return '';
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
