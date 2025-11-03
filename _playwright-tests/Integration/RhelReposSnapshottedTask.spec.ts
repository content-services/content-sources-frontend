import { test, expect, RepositoriesApi } from 'test-utils';

test.describe('RHEL Repos Snapshotted Task Status', () => {
  test('Verify RHEL repos are snapshotted', async ({ client }) => {
    const repositoriesApi = new RepositoriesApi(client);

    await test.step('Get RHEL repositories', async () => {
      const rhelRepos =
        (
          await repositoriesApi.listRepositories({
            origin: 'red_hat',
          })
        ).data || [];
      expect(rhelRepos.length).toBeGreaterThan(0);

      for (const repo of rhelRepos) {
        expect(
          repo.lastSnapshotTask?.status === 'completed' ||
            repo.lastSnapshotTask?.status === 'running',
        ).toBe(true);
      }
    });
  });
});
