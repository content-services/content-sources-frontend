import { test as base } from '@playwright/test';
import { getUnusedRepoUrl } from '../helpers/repoHelpers';

export const test = base.extend<{
  fedoraUrl: string;
}>({
  fedoraUrl: async ({ request }, use) => {
    const url = await getUnusedRepoUrl({ request });
    await use(url);
  },
});

export const expect = base.expect;
