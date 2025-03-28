import { expect, type Page } from '@playwright/test';

export const rank = () => Math.floor(Math.random() * 10 + 1).toString();
export const randomNum = () =>
  Math.floor(Math.random() * 10 + 1)
    .toString()
    .padStart(2, '0');

export const randomURL = () =>
  `https://stephenw.fedorapeople.org/multirepos/${rank()}/repo${randomNum()}/`;

export const bulkCreateRepos = async ({ request }: Page, repoCount: number) => {
  const list: Record<string, string>[] = [];
  for (let count = 0; count <= repoCount; count++) {
    list.push({
      name: `custom_repo-pagination-${count.toString().padStart(2, '0')}`,
      url: randomURL(),
    });
  }
  const response = await request.post(`/api/content-sources/v1/repositories/bulk_create/`, {
    data: JSON.stringify(list),
    headers: { 'Content-Type': 'application/json' },
  });

  // Ensure the request was successful
  expect(response.status()).toBe(201);
};
