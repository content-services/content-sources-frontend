/**
 * API RBAC Tests
 *
 * Tests API-level role-based access control for repositories and templates:
 * 1. Admin user can create, update, delete repos & templates
 * 2. Read-only user cannot create, update, or delete repos & templates (but can read)
 * 3. User from different org (stable_sam) cannot read repos and templates in admin's org
 */

import {
  test,
  expect,
  RepositoriesApi,
  TemplatesApi,
  cleanupRepositories,
  cleanupTemplates,
  randomName,
  expectErrorStatus,
} from 'test-utils';

const repoNamePrefix = 'API-RBAC-Test';
const templateNamePrefix = 'API-RBAC-Template-Test';

// Helper to get required tokens from env, skips test if any are missing
function requireTokens(...envVars: string[]): Record<string, string> {
  const tokens: Record<string, string> = {};
  const missing: string[] = [];

  for (const envVar of envVars) {
    const value = process.env[envVar] || '';
    tokens[envVar] = value;
    if (!value) missing.push(envVar);
  }

  if (missing.length > 0) {
    test.skip(true, `Missing tokens: ${missing.join(', ')}`);
  }

  return tokens;
}

// Auth override helper adds Authorization header to API requests
const withAuth =
  (token: string) =>
  async ({ init }: { init: RequestInit }): Promise<RequestInit> => ({
    ...init,
    headers: {
      ...((init.headers as Record<string, string> | undefined) ?? {}),
      Authorization: token,
    },
  });

// Helper to create a test repository
async function createTestRepository(
  api: RepositoriesApi,
  name: string,
  url: string,
  token: string,
): Promise<string> {
  const response = await api.createRepository(
    { apiRepositoryRequest: { name, url, snapshot: false } },
    withAuth(token),
  );
  expect(response.uuid).toBeDefined();
  return response.uuid!;
}

// Helper to create a test template
async function createTestTemplate(
  api: TemplatesApi,
  name: string,
  token: string,
  description = 'Test template for API RABC',
): Promise<string> {
  const response = await api.createTemplate(
    {
      apiTemplateRequest: {
        name,
        description,
        arch: 'x86_64',
        version: '9',
        repositoryUuids: [],
        useLatest: true,
      },
    },
    withAuth(token),
  );
  expect(response.uuid).toBeDefined();
  return response.uuid!;
}

// Helper to assert user cannot modify repositories (create, update, & delete, should return 401)
// Also verifies data is unchanged after denied update
async function assertCannotModifyRepository(
  api: RepositoriesApi,
  existingRepoUuid: string,
  originalName: string,
  restrictedToken: string,
  adminToken: string,
  newRepoUrl: string,
) {
  await expectErrorStatus(
    401,
    api.createRepository(
      {
        apiRepositoryRequest: {
          name: `${repoNamePrefix}-ShouldFail-${randomName()}`,
          url: newRepoUrl,
          snapshot: false,
        },
      },
      withAuth(restrictedToken),
    ),
  );

  await expectErrorStatus(
    401,
    api.partialUpdateRepository(
      { uuid: existingRepoUuid, apiRepositoryUpdateRequest: { name: 'ShouldNotUpdate' } },
      withAuth(restrictedToken),
    ),
  );

  // Verify data is unchanged after denied update
  const repoAfterDeniedUpdate = await api.getRepository(
    { uuid: existingRepoUuid },
    withAuth(adminToken),
  );
  expect(repoAfterDeniedUpdate.name).toBe(originalName);

  await expectErrorStatus(
    401,
    api.deleteRepository({ uuid: existingRepoUuid }, withAuth(restrictedToken)),
  );
}

// Helper to assert user cannot modify templates (create, update, & delete, should return 401)
// Also verifies data is unchanged after denied update
async function assertCannotModifyTemplate(
  api: TemplatesApi,
  existingTemplateUuid: string,
  originalName: string,
  restrictedToken: string,
  adminToken: string,
) {
  await expectErrorStatus(
    401,
    api.createTemplate(
      {
        apiTemplateRequest: {
          name: `${templateNamePrefix}-ShouldFail-${randomName()}`,
          description: 'Should fail',
          arch: 'x86_64',
          version: '9',
          repositoryUuids: [],
          useLatest: true,
        },
      },
      withAuth(restrictedToken),
    ),
  );

  await expectErrorStatus(
    401,
    api.partialUpdateTemplate(
      { uuid: existingTemplateUuid, apiTemplateUpdateRequest: { name: 'ShouldNotUpdate' } },
      withAuth(restrictedToken),
    ),
  );

  // Verify data is unchanged after denied update
  const templateAfterDeniedUpdate = await api.getTemplate(
    { uuid: existingTemplateUuid },
    withAuth(adminToken),
  );
  expect(templateAfterDeniedUpdate.name).toBe(originalName);

  await expectErrorStatus(
    401,
    api.deleteTemplate({ uuid: existingTemplateUuid }, withAuth(restrictedToken)),
  );
}

test.describe('API RBAC Tests', () => {
  test.skip(!process.env.RBAC, 'Skipping as the RBAC environment variable is not set to true.');

  // Set extraHTTPHeaders with ADMIN_TOKEN so the client fixture has auth for cleanup operations
  test.use({
    extraHTTPHeaders: process.env.ADMIN_TOKEN ? { Authorization: process.env.ADMIN_TOKEN } : {},
  });

  test.describe('Admin user can manage repos and templates', () => {
    test('Create, update, and delete repository', async ({ client, unusedRepoUrl, cleanup }) => {
      const { ADMIN_TOKEN: token } = requireTokens('ADMIN_TOKEN');

      const api = new RepositoriesApi(client);
      const repoName = `${repoNamePrefix}-Admin-${randomName()}`;
      await cleanup.runAndAdd(() => cleanupRepositories(client, repoNamePrefix));

      const repoUuid = await createTestRepository(api, repoName, await unusedRepoUrl(), token);

      await test.step('Update repository', async () => {
        const updatedName = `${repoName}-Updated`;
        const response = await api.partialUpdateRepository(
          { uuid: repoUuid, apiRepositoryUpdateRequest: { name: updatedName } },
          withAuth(token),
        );
        expect(response.name).toBe(updatedName);
      });

      await test.step('Delete repository', async () => {
        await api.deleteRepository({ uuid: repoUuid }, withAuth(token));
        await expectErrorStatus(404, api.getRepository({ uuid: repoUuid }, withAuth(token)));
      });
    });

    test('Create, update, and delete template', async ({ client, cleanup }) => {
      const { ADMIN_TOKEN: token } = requireTokens('ADMIN_TOKEN');

      const api = new TemplatesApi(client);
      const templateName = `${templateNamePrefix}-Admin-${randomName()}`;
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));

      const templateUuid = await createTestTemplate(api, templateName, token);

      await test.step('Update template', async () => {
        const updatedName = `${templateName}-Updated`;
        const response = await api.partialUpdateTemplate(
          { uuid: templateUuid, apiTemplateUpdateRequest: { name: updatedName } },
          withAuth(token),
        );
        expect(response.name).toBe(updatedName);
      });

      await test.step('Delete template', async () => {
        await api.deleteTemplate({ uuid: templateUuid }, withAuth(token));
        await expectErrorStatus(404, api.getTemplate({ uuid: templateUuid }, withAuth(token)));
      });
    });
  });

  test.describe('Read-only user cannot modify resources', () => {
    test('Read-only user can read but cannot modify repositories', async ({
      client,
      unusedRepoUrl,
      cleanup,
    }) => {
      const { ADMIN_TOKEN: adminToken, READONLY_TOKEN: readonlyToken } = requireTokens(
        'ADMIN_TOKEN',
        'READONLY_TOKEN',
      );

      const api = new RepositoriesApi(client);
      const repoName = `${repoNamePrefix}-ReadOnly-${randomName()}`;
      await cleanup.runAndAdd(() => cleanupRepositories(client, repoNamePrefix));

      const repoUuid = await createTestRepository(api, repoName, await unusedRepoUrl(), adminToken);

      await test.step('Read-only user can read repository', async () => {
        const response = await api.getRepository({ uuid: repoUuid }, withAuth(readonlyToken));
        expect(response.uuid).toBe(repoUuid);
      });

      await test.step('Read-only user cannot modify repository', async () => {
        await assertCannotModifyRepository(
          api,
          repoUuid,
          repoName,
          readonlyToken,
          adminToken,
          await unusedRepoUrl(),
        );
      });
    });

    test('Read-only user can read but cannot modify templates', async ({ client, cleanup }) => {
      const { ADMIN_TOKEN: adminToken, READONLY_TOKEN: readonlyToken } = requireTokens(
        'ADMIN_TOKEN',
        'READONLY_TOKEN',
      );

      const api = new TemplatesApi(client);
      const templateName = `${templateNamePrefix}-ReadOnly-${randomName()}`;
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));

      const templateUuid = await createTestTemplate(api, templateName, adminToken);

      await test.step('Read-only user can read template', async () => {
        const response = await api.getTemplate({ uuid: templateUuid }, withAuth(readonlyToken));
        expect(response.uuid).toBe(templateUuid);
      });

      await test.step('Read-only user cannot modify template', async () => {
        await assertCannotModifyTemplate(
          api,
          templateUuid,
          templateName,
          readonlyToken,
          adminToken,
        );
      });
    });
  });

  test.describe('Cross-org isolation (stable_sam user from different org)', () => {
    test('User from different org cannot read repositories', async ({
      client,
      unusedRepoUrl,
      cleanup,
    }) => {
      const { ADMIN_TOKEN: adminToken, STABLE_SAM_TOKEN: stableSamToken } = requireTokens(
        'ADMIN_TOKEN',
        'STABLE_SAM_TOKEN',
      );

      const api = new RepositoriesApi(client);
      const repoName = `${repoNamePrefix}-CrossOrg-${randomName()}`;
      await cleanup.runAndAdd(() => cleanupRepositories(client, repoNamePrefix));

      const repoUuid = await createTestRepository(api, repoName, await unusedRepoUrl(), adminToken);

      await test.step('stable_sam cannot read repository (expect 404)', async () => {
        await expectErrorStatus(
          404,
          api.getRepository({ uuid: repoUuid }, withAuth(stableSamToken)),
        );
      });

      await test.step('Admin can list the repository', async () => {
        const response = await api.listRepositories(
          { search: repoName, origin: 'external' },
          withAuth(adminToken),
        );
        expect(response.data?.length ?? 0).toBeGreaterThan(0);
        expect(response.data?.some((r) => r.uuid === repoUuid)).toBe(true);
      });

      await test.step('stable_sam cannot list repositories from another org', async () => {
        const response = await api.listRepositories(
          { search: repoName, origin: 'external' },
          withAuth(stableSamToken),
        );
        expect(response.data?.length ?? 0).toBe(0);
      });
    });

    test('User from different org cannot read templates', async ({ client, cleanup }) => {
      const { ADMIN_TOKEN: adminToken, STABLE_SAM_TOKEN: stableSamToken } = requireTokens(
        'ADMIN_TOKEN',
        'STABLE_SAM_TOKEN',
      );

      const api = new TemplatesApi(client);
      const templateName = `${templateNamePrefix}-CrossOrg-${randomName()}`;
      await cleanup.runAndAdd(() => cleanupTemplates(client, templateNamePrefix));

      const templateUuid = await createTestTemplate(api, templateName, adminToken);

      await test.step('stable_sam cannot read template (expect 404)', async () => {
        await expectErrorStatus(
          404,
          api.getTemplate({ uuid: templateUuid }, withAuth(stableSamToken)),
        );
      });

      await test.step('Admin can list the template', async () => {
        const response = await api.listTemplates({ name: templateName }, withAuth(adminToken));
        expect(response.data?.length ?? 0).toBeGreaterThan(0);
        expect(response.data?.some((t) => t.uuid === templateUuid)).toBe(true);
      });

      await test.step('stable_sam cannot list templates from another org', async () => {
        const response = await api.listTemplates({ name: templateName }, withAuth(stableSamToken));
        expect(response.data?.length ?? 0).toBe(0);
      });
    });
  });
});
