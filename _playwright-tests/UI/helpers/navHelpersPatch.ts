import { type Page } from '@playwright/test';
import { test } from 'test-utils';
import { retry } from './helpers';

const navigateToSystemsFunc = async (page: Page) => {
  await page.goto('/insights/patch/systems', { timeout: 10000 });
  const systemText = page.getByText('Systems up to date');
  await systemText.waitFor({ state: 'visible', timeout: 90000 });
};

export const navigateToSystems = async (page: Page) => {
  await test.step(
    `Navigating to Systems`,
    async () => {
      try {
        const systemsNavLink = page.getByRole('navigation').getByRole('link', { name: 'Systems' });
        await systemsNavLink.waitFor({ state: 'visible', timeout: 1500 });
        await systemsNavLink.click();
      } catch {
        await retry(page, navigateToSystemsFunc, 5);
      }
    },
    {
      box: true,
    },
  );
};

const navigateToAdvisoriesFunc = async (page: Page) => {
  await page.goto('/insights/patch/advisories', { timeout: 10000 });
  const advisoryText = page.getByText('Most impactful advisories');
  await advisoryText.waitFor({ state: 'visible', timeout: 90000 });
};

export const navigateToAdvisories = async (page: Page) => {
  await test.step(
    `Navigating to Advisories`,
    async () => {
      try {
        const advisoriesNavLink = page.getByRole('navigation').getByRole('link', { name: 'Advisories' });
        await advisoriesNavLink.waitFor({ state: 'visible', timeout: 1500 });
        await advisoriesNavLink.click();
      } catch {
        await retry(page, navigateToAdvisoriesFunc, 5);
      }
    },
    {
      box: true,
    },
  );
};


const navigateToPackagesFunc = async (page: Page) => {
  await page.goto('/insights/patch/packages', { timeout: 10000 });
  const packagesText = page.getByText('Status');
  await packagesText.waitFor({ state: 'visible', timeout: 90000 });
};

export const navigateToPackages = async (page: Page) => {
  await test.step(
    `Navigating to Packages`,
    async () => {
      try {
        const packagesNavLink = page.getByRole('navigation').getByRole('link', { name: 'Packages' });
        await packagesNavLink.waitFor({ state: 'visible', timeout: 1500 });
        await packagesNavLink.click();
      } catch {
        await retry(page, navigateToPackagesFunc, 5);
      }
    },
    {
      box: true,
    },
  );
};

const navigateToDashboardFunc = async (page: Page) => {
  await page.goto('/insights/dashboard#SIDs=&tags=', { timeout: 10000 });
//   const dashboardText = page.getByText('Dashboard');
//   await dashboardText.waitFor({ state: 'visible', timeout: 90000 });
};

export const navigateToDashboard = async (page: Page) => {
  await test.step(
    `Navigating to Dashboard`,
    async () => {
      try {
        await page.route('https://consent.trustarc.com/**', (route) => route.abort());
        await page.route('https://smetrics.redhat.com/**', (route) => route.abort());

        const dashboardNavLink = page
          .getByRole('navigation')
          .getByRole('link', { name: 'Dashboard' });
        await dashboardNavLink.waitFor({ state: 'visible', timeout: 1500 });
        await dashboardNavLink.click();
      } catch {
        await retry(page, navigateToDashboardFunc, 5);
      }
    },
    {
      box: true,
    },
  );
};
