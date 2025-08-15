import { expect, type APIRequestContext } from '@playwright/test';

let counter = 1;

export const incrementNum = () => (counter++).toString().padStart(2, '0');

export const randomName = () => (Math.random() + 1).toString(36).substring(2, 6);

// Generate unused Fedora URL
const generateUnusedUrl = () =>
  `https://content-services.github.io/fixtures/yum/centirepos/repo${incrementNum()}/`;

// Helper function to find an unused Fedora URL
export const getUnusedRepoUrl = async ({ request }: { request: APIRequestContext }) => {
  while (true) {
    const url = generateUnusedUrl();

    try {
      // Make API request to check if there is a repo already using the Fedora URL.
      const response = await request.get('/api/content-sources/v1/repositories/?origin=external', {
        params: { search: url },
      });

      // Ensure the request was successful
      expect(response.status()).toBe(200);

      // Parse response
      const data = await response.json();

      // Stop if no search results (URL is unused)
      if (data.meta?.count === 0) {
        return url;
      }
    } catch (error) {
      console.error(`Error checking URL ${url}:`, error);
      throw new Error('Failed to verify URL availability');
    }
  }
};
