import { describe } from 'node:test';
import { test, expect } from '@playwright/test';
import { navigateToRepositories } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/helpers';

describe('Red Hat Repositories', () => {
  test('Red Hat repository exists and is valid', async ({ page }) => {
    await navigateToRepositories(page);
    await closePopupsIfExist(page);
    const redHatToggle = page.getByTestId('redhat-repositories-toggle');
    await redHatToggle.click();

    await expect(page.getByText('Red Hat Ansible Engine 2 for RHEL 8 x86_64 (RPMs)')).toBeVisible();
    await expect(page.getByText('Valid')).toBeVisible();
    await expect(page.getByText('Last snapshot')).toBeVisible();
  });
});