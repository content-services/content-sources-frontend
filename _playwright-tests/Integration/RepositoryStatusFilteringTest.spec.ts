import {
  test,
  expect,
  RepositoriesApi,
  ApiRepositoryResponse,
  cleanupRepositories,
} from 'test-utils';

/**
 * Repository Status Filtering Test
 * Tests that repository listings can be filtered by status (Pending, Valid, Invalid).
 * This test creates repositories with valid and invalid URLs to test status-based filtering.
 */

test.describe('Repository Status Filtering Test', () => {
  test('should filter repository listings by status - Pending, Valid, Invalid', async ({
    client,
    cleanup,
  }) => {
    await cleanup.runAndAdd(() => cleanupRepositories(client, 'FilterStatus'));

    const repositoriesApi = new RepositoriesApi(client);
    const baseRepoName = `FilterStatus-${Date.now()}`;

    const validRepoUrl = 'https://content-services.github.io/fixtures/yum/centirepos/repo01/';
    const invalidRepoUrl = 'https://non-existent-domain-for-testing-invalid-status.invalid/repo/';

    let validRepo: ApiRepositoryResponse;
    let invalidRepo: ApiRepositoryResponse;

    await test.step('create repositories for status testing', async () => {
      validRepo = await repositoriesApi.createRepository({
        apiRepositoryRequest: {
          name: `${baseRepoName}-valid`,
          url: validRepoUrl,
          distributionArch: 'x86_64',
          distributionVersions: ['8'],
        },
      });

      invalidRepo = await repositoriesApi.createRepository({
        apiRepositoryRequest: {
          name: `${baseRepoName}-invalid`,
          url: invalidRepoUrl,
          distributionArch: 's390x',
          distributionVersions: ['8'],
        },
      });

      expect(validRepo).toBeDefined();
      expect(invalidRepo).toBeDefined();
    });

    await test.step('verify initial repository status', async () => {
      const validRepoResponse = await repositoriesApi.getRepository({
        uuid: validRepo.uuid!,
      });
      expect(['Valid']).toContain(validRepoResponse.status);

      const invalidRepoResponse = await repositoriesApi.getRepository({
        uuid: invalidRepo.uuid!,
      });
      expect(['Invalid']).toContain(invalidRepoResponse.status);
    });

    await test.step('test filter by Pending and Valid status', async () => {
      const pendingValidResponse = await repositoriesApi.listRepositories({
        status: 'Pending,Valid',
        origin: 'external',
      });

      const repoNames = pendingValidResponse.data?.map((repo) => repo.name) || [];
      const repoStatuses = pendingValidResponse.data?.map((repo) => repo.status) || [];

      expect(repoNames).toContain(`${baseRepoName}-valid`);

      expect(repoNames).not.toContain(`${baseRepoName}-invalid`);

      expect(repoStatuses).not.toContain('Invalid');

      repoStatuses.forEach((status) => {
        expect(['Pending', 'Valid']).toContain(status);
      });
    });

    await test.step('test filter by Invalid status', async () => {
      const invalidResponse = await repositoriesApi.listRepositories({
        status: 'Invalid',
        origin: 'external',
      });

      const repoNames = invalidResponse.data?.map((repo) => repo.name) || [];
      const repoStatuses = invalidResponse.data?.map((repo) => repo.status) || [];

      expect(repoNames).toContain(`${baseRepoName}-invalid`);

      expect(repoNames).not.toContain(`${baseRepoName}-valid`);

      repoStatuses.forEach((status) => {
        expect(status).toBe('Invalid');
      });

      expect(repoStatuses).not.toContain('Valid');
      expect(repoStatuses).not.toContain('Pending');
    });

    await test.step('test filter excluding Invalid status', async () => {
      const validPendingResponse = await repositoriesApi.listRepositories({
        status: 'Valid,Pending',
        origin: 'external',
      });

      const repoNames = validPendingResponse.data?.map((repo) => repo.name) || [];
      const repoStatuses = validPendingResponse.data?.map((repo) => repo.status) || [];

      expect(repoNames).not.toContain(`${baseRepoName}-invalid`);

      expect(repoStatuses).not.toContain('Invalid');

      repoStatuses.forEach((status) => {
        expect(['Valid', 'Pending']).toContain(status);
      });
    });

    await test.step('verify repository status details', async () => {
      const validRepoDetails = await repositoriesApi.getRepository({ uuid: validRepo.uuid! });
      const invalidRepoDetails = await repositoriesApi.getRepository({ uuid: invalidRepo.uuid! });

      expect(['Valid', 'Pending']).toContain(validRepoDetails.status);

      expect(invalidRepoDetails.status).toBe('Invalid');

      expect(validRepoDetails.name).toBe(`${baseRepoName}-valid`);
      expect(invalidRepoDetails.name).toBe(`${baseRepoName}-invalid`);
      expect(validRepoDetails.url).toBe(validRepoUrl);
      expect(invalidRepoDetails.url).toBe(invalidRepoUrl);
    });
  });
});
