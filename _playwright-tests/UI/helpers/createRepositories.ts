import { expect, type Page } from '@playwright/test';

export const bulkCreateRepos = async (
  { request }: Page,
  repoCount: number,
  repoNamePrefix: string,
) => {
  const list: Record<string, string | boolean | number>[] = [];
  for (let count = 1; count <= repoCount; count++) {
    const repoNum = `${count.toString().padStart(2, '0')}`;
    const randomURL = () => `https://stephenw.fedorapeople.org/centirepos/repo${repoNum}/`;
    list.push({
      name: `${repoNamePrefix}-${repoNum}`,
      url: randomURL(),
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
