import { expect, type Page } from '@playwright/test';

export const deleteAllTemplates = async ({ request }: Page, filter?: string) => {
  const response = await request.get(`/api/content-sources/v1/templates/?${filter}`);

  // Ensure the request was successful
  expect(response.status()).toBe(200);

  // Parse the response body
  const body = await response.json();

  // Check that the response body contains an array of data
  expect(Array.isArray(body.data)).toBeTruthy();

  // Extract UUIDs from the response data
  const uuidList = body.data.map((data: { uuid: string }) => data.uuid) as string[];

  // If there are UUIDs to delete, make the delete request
  if (uuidList.length > 0)
    for (const value of uuidList) {
      try {
        const result = await request.delete(`/api/content-sources/v1/templates/${value}`);

        // Ensure the deletion was successful
        expect(result.status()).toBe(204);
      } catch (error) {
        console.error('Failed to delete template:', error);
        throw error;
      }
    }
};
