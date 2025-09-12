import {
  test,
  expect,
  RepositoriesApi,
  ApiRepositoryResponse,
  cleanupRepositories,
} from 'test-utils';

/**
 * Repository Filtering Test
 * Tests that repository listings can be filtered by various parameters including
 * architecture, version, UUID, URL, and text search.
 * Converted from Python pytest test_list_content_with_filter.
 */

test.describe('Repository Filtering Test', () => {
  const createdRepos: ApiRepositoryResponse[] = [];

  test('should filter repository listings with various parameters', async ({ client, cleanup }) => {
    // Add cleanup at the start
    await cleanup.runAndAdd(() => cleanupRepositories(client, 'Filter-Test'));

    // Initialize the API with the client fixture
    const repositoriesApi = new RepositoriesApi(client);
    const baseRepoName = `Filter-Test-${Date.now()}`;

    await test.step('create test repositories', async () => {
      // Create repo 1: ppc64le architecture, version 8
      const repo1 = await repositoriesApi.createRepository({
        apiRepositoryRequest: {
          name: `${baseRepoName}-1`,
          url: 'https://dl.fedoraproject.org/pub/epel/8/Everything/ppc64le/',
          distributionArch: 'ppc64le',
          distributionVersions: ['8'],
        },
      });
      createdRepos.push(repo1);

      // Create repo 2: x86_64 architecture, version 9
      const repo2 = await repositoriesApi.createRepository({
        apiRepositoryRequest: {
          name: `${baseRepoName}-2`,
          url: 'https://dl.fedoraproject.org/pub/epel/9/Everything/x86_64/',
          distributionArch: 'x86_64',
          distributionVersions: ['9'],
        },
      });
      createdRepos.push(repo2);

      // Create repo 3: x86_64 architecture, version 8
      const repo3 = await repositoriesApi.createRepository({
        apiRepositoryRequest: {
          name: `${baseRepoName}-3`,
          url: 'https://dl.fedoraproject.org/pub/epel/8/Everything/x86_64/',
          distributionArch: 'x86_64',
          distributionVersions: ['8'],
        },
      });
      createdRepos.push(repo3);

      expect(createdRepos).toHaveLength(3);
    });

    await test.step('Test single-value filters', async () => {
      // Filter by architecture x86_64
      const x86Response = await repositoriesApi.listRepositories({
        arch: 'x86_64',
        origin: 'external',
      });

      const x86RepoNames = x86Response.data?.map((repo) => repo.name) || [];
      expect(x86RepoNames).toContain(`${baseRepoName}-2`);
      expect(x86RepoNames).toContain(`${baseRepoName}-3`);
      expect(x86RepoNames).not.toContain(`${baseRepoName}-1`);

      // Filter by version 8
      const version8Response = await repositoriesApi.listRepositories({
        version: '8',
        origin: 'external',
      });

      const version8RepoNames = version8Response.data?.map((repo) => repo.name) || [];
      expect(version8RepoNames).toContain(`${baseRepoName}-1`);
      expect(version8RepoNames).toContain(`${baseRepoName}-3`);
      expect(version8RepoNames).not.toContain(`${baseRepoName}-2`);

      // Filter by available_for_version 9
      const availableVersion9Response = await repositoriesApi.listRepositories({
        availableForVersion: '9',
        origin: 'external',
      });

      const availableVersion9Names = availableVersion9Response.data?.map((repo) => repo.name) || [];
      expect(availableVersion9Names).toContain(`${baseRepoName}-2`);

      // Filter by available_for_arch ppc64le
      const availablePpc64Response = await repositoriesApi.listRepositories({
        availableForArch: 'ppc64le',
        origin: 'external',
      });

      const availablePpc64Names = availablePpc64Response.data?.map((repo) => repo.name) || [];
      expect(availablePpc64Names).toContain(`${baseRepoName}-1`);
    });

    await test.step('Test multi-value filters (comma-separated)', async () => {
      // Filter by multiple architectures
      const multiArchResponse = await repositoriesApi.listRepositories({
        arch: 'x86_64,ppc64le',
        origin: 'external',
      });

      const multiArchNames = multiArchResponse.data?.map((repo) => repo.name) || [];
      expect(multiArchNames).toContain(`${baseRepoName}-1`);
      expect(multiArchNames).toContain(`${baseRepoName}-2`);
      expect(multiArchNames).toContain(`${baseRepoName}-3`);

      // Filter by multiple versions
      const multiVersionResponse = await repositoriesApi.listRepositories({
        version: '8,9',
        origin: 'external',
      });

      const multiVersionNames = multiVersionResponse.data?.map((repo) => repo.name) || [];
      expect(multiVersionNames).toContain(`${baseRepoName}-1`);
      expect(multiVersionNames).toContain(`${baseRepoName}-2`);
      expect(multiVersionNames).toContain(`${baseRepoName}-3`);
    });

    await test.step('Test UUID-based filtering', async () => {
      const repo1 = createdRepos[0];
      const repo2 = createdRepos[1];

      // Filter by single UUID
      const singleUuidResponse = await repositoriesApi.listRepositories({
        uuid: repo1.uuid,
        origin: 'external',
      });

      expect(singleUuidResponse.meta?.count).toBe(1);
      expect(singleUuidResponse.data?.[0]?.uuid).toBe(repo1.uuid);

      // Filter by multiple UUIDs (comma-separated)
      const multiUuidResponse = await repositoriesApi.listRepositories({
        uuid: `${repo1.uuid},${repo2.uuid}`,
        origin: 'external',
      });

      expect(multiUuidResponse.meta?.count).toBe(2);
      const returnedUuids = multiUuidResponse.data?.map((repo) => repo.uuid) || [];
      expect(returnedUuids).toContain(repo1.uuid);
      expect(returnedUuids).toContain(repo2.uuid);
    });

    await test.step('Test URL-based filtering', async () => {
      const repo1 = createdRepos[0];
      const repo2 = createdRepos[1];

      // Filter by single URL
      const singleUrlResponse = await repositoriesApi.listRepositories({
        url: repo1.url,
        origin: 'external',
      });

      expect(singleUrlResponse.meta?.count).toBe(1);
      expect(singleUrlResponse.data?.[0]?.url).toBe(repo1.url);

      // Filter by multiple URLs (comma-separated)
      const multiUrlResponse = await repositoriesApi.listRepositories({
        url: `${repo1.url},${repo2.url}`,
        origin: 'external',
      });

      expect(multiUrlResponse.meta?.count).toBe(2);
      const returnedUrls = multiUrlResponse.data?.map((repo) => repo.url) || [];
      expect(returnedUrls).toContain(repo1.url);
      expect(returnedUrls).toContain(repo2.url);
    });

    await test.step('Test text search functionality', async () => {
      const repo1 = createdRepos[0];

      // Search by exact repository name - returns 1 repo
      const nameSearchResponse = await repositoriesApi.listRepositories({
        search: repo1.name,
        origin: 'external',
      });

      expect(nameSearchResponse.meta?.count).toBe(1);
      expect(nameSearchResponse.data?.[0]?.name).toBe(repo1.name);

      // Search by partial name - returns 3 repos
      const partialSearchResponse = await repositoriesApi.listRepositories({
        search: baseRepoName,
        origin: 'external',
      });

      expect(partialSearchResponse.meta?.count).toBeGreaterThanOrEqual(3);
      const searchResultNames = partialSearchResponse.data?.map((repo) => repo.name) || [];
      expect(searchResultNames).toContain(`${baseRepoName}-1`);
      expect(searchResultNames).toContain(`${baseRepoName}-2`);
      expect(searchResultNames).toContain(`${baseRepoName}-3`);
    });
  });
});
