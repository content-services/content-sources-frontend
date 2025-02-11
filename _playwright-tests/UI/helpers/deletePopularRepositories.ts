import { expect, type Page } from '@playwright/test';

export const deleteAllPopularRepos = async ({ request }: Page) => {
  const response = await request.get('/api/content-sources/v1/popular_repositories/?');

  // Ensure the request was successful
  console.log('response.status');
  expect(response.status() >= 200 && response.status() < 300).toBeTruthy();

  // Parse the response body
  const body = await response.json();

  // Check that the response body contains an array of data
  expect(Array.isArray(body.data)).toBeTruthy();

  const uuidList = body.data.map(({ uuid }) => uuid).filter((uuid) => !!uuid);

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
      throw error; // Optionally re-throw the error if you need to fail the test
    }
  } else {
    console.log('No repositories to delete.');
  }
};
