import { expect, type Page } from '@playwright/test';

export const bulkCreateRepos = async (
  { request }: Page,
  repoCount: number,
  repoNamePrefix: string,
  unusedRepoUrl: () => Promise<string>,
) => {
  const list: Record<string, string | boolean | number>[] = [];
  for (let count = 1; count <= repoCount; count++) {
    const repoNum = `${count.toString().padStart(2, '0')}`;
    list.push({
      name: `${repoNamePrefix}-${repoNum}`,
      url: await unusedRepoUrl(),
      snapshot: false,
    });
  }
  const response = await request.post(`/api/content-sources/v1/repositories/bulk_create/`, {
    data: list,
    headers: { 'Content-Type': 'application/json' },
  });

  // Ensure the request was successful
  expect(response.status()).toBe(201);
};

export const createCustomRepo = async (
  { request }: Page,
  repoName: string,
  unusedRepoUrl: () => Promise<string>,
) => {
  const url = await unusedRepoUrl();
  const repoData = {
    distribution_arch: 'aarch64',
    distribution_versions: ['9', '10'],
    name: repoName,
    origin: 'external',
    snapshot: true,
    url,
  };

  try {
    const response = await request.post('/api/content-sources/v1/repositories/', {
      data: repoData, // Will be automatically stringified by Playwright
      headers: { 'Content-Type': 'application/json' }, // Optional if data is an object
    });

    // Check if response is successful
    if (!response.ok()) {
      throw new Error(`Request failed with status ${response.status()}`);
    }

    // Parse response body
    const data = await response.json();

    // Extract and return UUID (assuming it's in data.uuid)
    const uuid = data?.uuid;
    if (!uuid) {
      throw new Error('UUID not found in response');
    }

    return uuid;
  } catch (error) {
    console.error('Error creating custom repo:', error);
    throw error;
  }
};
