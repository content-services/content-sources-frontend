import {
  test,
  expect,
  RepositoriesApi,
  PopularRepositoriesApi,
  EnvironmentsApi,
  ApiRepositoryResponse,
  ApiPopularRepositoryResponse,
} from 'test-utils';

/**
 * Test the API support for list / search environments using stable_sam user
 * This test validates that environment search endpoints work correctly for both URL and UUID searches.
 */

test.describe('Search Environment Endpoint', () => {
  test.use({
    storageState: '.auth/stable_sam_stage.json',
    extraHTTPHeaders: process.env.STABLE_SAM_STAGE_TOKEN
      ? { Authorization: process.env.STABLE_SAM_STAGE_TOKEN }
      : {},
  });
  const keyword = 'kde';

  // Simple test focusing on basic API functionality
  test('should perform basic environment search with popular repository', async ({ client }) => {
    const repositoriesApi = new RepositoriesApi(client);
    const popularRepositoriesApi = new PopularRepositoriesApi(client);
    const environmentsApi = new EnvironmentsApi(client);

    let popularRepo: ApiPopularRepositoryResponse;
    let testRepo: ApiRepositoryResponse | null = null;

    await test.step('Get a popular repository for testing', async () => {
      const popularRepos = await popularRepositoriesApi.listPopularRepositories({});

      expect(popularRepos.data).toBeDefined();
      popularRepo = popularRepos.data![0];
    });

    await test.step('Use popular repository directly if already added, or add it', async () => {
      if (popularRepo.uuid) {
        const existingRepo = await repositoriesApi.getRepository({
          uuid: popularRepo.uuid,
        });
        testRepo = existingRepo;
      } else {
        const addedRepo = await repositoriesApi.createRepository({
          apiRepositoryRequest: {
            name: popularRepo.suggestedName!,
            url: popularRepo.url!,
            gpgKey: popularRepo.gpgKey || '',
          },
        });
        testRepo = addedRepo;
      }

      expect(testRepo!.uuid).toBeDefined();
    });

    await test.step('Search environments with keyword using popular repository URL', async () => {
      const environmentSearch = await environmentsApi.searchEnvironments({
        apiContentUnitSearchRequest: {
          urls: [popularRepo.url!],
          search: keyword,
        },
      });

      expect(environmentSearch).toBeDefined();
      expect(environmentSearch[0].id).toContain(keyword);
      expect(environmentSearch[0].environmentName).toBeDefined();
    });

    await test.step('Search environments with keyword using popular repository UUID', async () => {
      const environmentSearchByUuid = await environmentsApi.searchEnvironments({
        apiContentUnitSearchRequest: {
          uuids: [testRepo!.uuid!],
          search: keyword,
        },
      });

      expect(environmentSearchByUuid).toBeDefined();
      expect(environmentSearchByUuid[0].id).toContain(keyword);
      expect(environmentSearchByUuid[0].environmentName).toBeDefined();
    });
  });
});
