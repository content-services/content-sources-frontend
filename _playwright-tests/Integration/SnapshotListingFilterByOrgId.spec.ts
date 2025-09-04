import { test, expect, RepositoriesApi, expectError } from 'test-utils';

/**
 * Test that snapshot listing filters response depending upon different org.
 * This test validates that snapshot listing filters response based on organization ID.
 * It uses the stable_sam_stage user to create a repository and then tests that
 * other organization users cannot access the repository configuration file.
 */

test.describe('Snapshot Listing Filter by Org ID', () => {
  test('should filter snapshot listing based on cross organization user', async ({ client }) => {
    const repositoriesApi = new RepositoriesApi(client);
    const testRepoUrl = 'https://yum.theforeman.org/pulpcore/3.4/el7/x86_64/';
    let samRepoUuid: string;

    await test.step('List repository using stable_sam_stage user', async () => {
      const reposResponse = await repositoriesApi.listRepositories(
        { search: testRepoUrl },
        {
          headers: {
            Authorization: process.env.STABLE_SAM_STAGE_TOKEN || '',
          },
        },
      );

      expect(reposResponse.data).toBeDefined();
      expect(reposResponse.data?.length).toBe(1);

      const samRepo = reposResponse.data![0];
      expect(samRepo.uuid).toBeDefined();
      samRepoUuid = samRepo.uuid!;
      expect(samRepo.status).toBe('Valid');
    });

    await test.step('Get repository data with snapshot UUID', async () => {
      const samDataResponse = await repositoriesApi.getRepository(
        { uuid: samRepoUuid },
        {
          headers: {
            Authorization: process.env.STABLE_SAM_STAGE_TOKEN || '',
          },
        },
      );
      expect(samDataResponse.lastSnapshotUuid).toBeDefined();

      await test.step('Verify other org user cannot access repository configuration file', async () => {
        await expectError(
          404,
          'Error getting repository configuration file',
          repositoriesApi.getRepoConfigurationFile({
            snapshotUuid: samDataResponse.lastSnapshotUuid!,
          }),
        );
      });
    });
  });
});
