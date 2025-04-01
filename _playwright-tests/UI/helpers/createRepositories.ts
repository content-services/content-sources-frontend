import { expect, type Page } from '@playwright/test';

export const bulkCreateRepos = async ({ request }: Page, repoCount: number) => {
  const list: Record<string, string | boolean | number>[] = [];
  for (let count = 1; count <= repoCount; count++) {
    const rank = () => Math.floor(Math.random() * 100 + 1).toString();
    const repoNum = `${count.toString().padStart(2, '0')}`;
    const randomURL = () =>
      `https://stephenw.fedorapeople.org/multirepos/${rank()}/repo${repoNum}/`;
    list.push({
      name: `custom_repo-pagination-${repoNum}`,
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
