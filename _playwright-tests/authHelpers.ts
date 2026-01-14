import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';

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
  await expect(page.getByText('Log in to your Red Hat account')).toBeVisible();
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

  await expect(page.getByText('Log in to your Red Hat account')).toBeVisible();

  const login = page.getByRole('textbox');
  await login.fill(username);
  await login.press('Enter');
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.fill(password);
  await passwordField.press('Enter');

  await expect(async () => {
    expect(page.url()).toContain(`${process.env.BASE_URL}/insights/content/repositories`);

    const cookies = await page.context().cookies();
    const found = cookies.find((cookie) => cookie.name === 'cs_jwt');
    expect(found).toBeDefined();
  }).toPass({
    intervals: [1_000],
    timeout: 30_000,
  });
};

export const storeStorageStateAndToken = async (page: Page, tokenEnvVar: string) => {
  const storageFile = `${tokenEnvVar}.json`;
  const { cookies } = await page
    .context()
    .storageState({ path: path.join(__dirname, '../.auth', storageFile) });
  const token = cookies.find((cookie) => cookie.name === 'cs_jwt')?.value;
  expect(token).toBeDefined();
  process.env.TOKEN = `Bearer ${token}`;
  process.env[tokenEnvVar] = `Bearer ${token}`;
};

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

export const ensureNotInPreview = async (page: Page) => {
  const toggle = page.locator('div').filter({ hasText: 'Preview mode' }).getByRole('switch');
  if ((await toggle.isVisible()) && (await toggle.isChecked())) {
    await toggle.click();
  }
};

export const ensureInPreview = async (page: Page) => {
  const toggle = page.locator('div').filter({ hasText: 'Preview mode' }).getByRole('switch');
  await expect(toggle).toBeVisible();
  if (!(await toggle.isChecked())) {
    await toggle.click();
  }
  const turnOnButton = page.getByRole('button', { name: 'Turn on' });
  if (await turnOnButton.isVisible()) {
    await turnOnButton.click();
  }
  await expect(toggle).toBeChecked();
};
