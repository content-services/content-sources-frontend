import { expect, type Page } from '@playwright/test';

export const deleteAllRepos = async ({ request }: Page, filter?: string) => {
  const response = await request.get(
    `/api/content-sources/v1/repositories/?origin=external,upload${filter}`,
  );

  // Ensure the request was successful
  expect(response.status()).toBe(200);

  // Parse the response body
  const body = await response.json();

  // Check that the response body contains an array of data
  expect(Array.isArray(body.data)).toBeTruthy();

  // Extract UUIDs from the response data
  const uuidList = body.data.map((data: { uuid: string }) => data.uuid) as string[];

  // If there are UUIDs to delete, make the delete request
  if (uuidList.length > 0) {
    try {
      const result = await request.post('/api/content-sources/v1/repositories/bulk_delete/', {
        data: {
          uuids: uuidList,
        },
      });

      // Ensure the deletion was successful
      expect(result.status()).toBe(204);
    } catch (error) {
      console.error('Failed to delete repositories:', error);
      throw error;
    }
  }
};
