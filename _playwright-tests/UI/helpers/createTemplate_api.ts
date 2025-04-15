import { expect, type Page } from '@playwright/test';

export const createTemplate = async (
  page: Page,
  template: {
    arch: string;
    description: string;
    name: string;
    repository_uuids: string[];
    use_latest: boolean;
    version: string;
  },
) => {
  // Constructing the template data for the API request
  const templateData = {
    arch: template.arch,
    description: template.description,
    name: template.name,
    repository_uuids: template.repository_uuids,
    use_latest: template.use_latest,
    version: template.version,
  };

  // Send the POST request to create the template
  const response = await page.request.post(`/api/content-sources/v1/templates/`, {
    data: templateData,
    headers: { 'Content-Type': 'application/json' },
  });

  // Ensure the request was successful
  expect(response.status()).toBe(201);
};
