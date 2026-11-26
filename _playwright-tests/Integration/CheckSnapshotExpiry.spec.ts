import { test, expect } from 'test-utils';
import {
  RepositoriesApi,
  SnapshotsApi,
  ListRepositoriesRequest,
  ListSnapshotsForRepoRequest,
  ApiSnapshotResponse,
} from 'test-utils/client';

test.describe('Snapshot Expiry Check', () => {
  const isProd = !!process.env.PROD;
  const retentionDays = isProd ? 366 : 91;
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - retentionDays);
  const envName = isProd ? 'PROD' : 'STAGE';

  const user = isProd ? 'read-only' : 'stable_sam';
  const token = isProd ? process.env.READONLY_TOKEN : process.env.STABLE_SAM_TOKEN;

  test.use({
    storageState: `.auth/${user}.json`,
    extraHTTPHeaders: token ? { Authorization: token } : {},
  });

  test(`Check snapshot expiry for Red Hat and EPEL repositories (Env: ${envName}, Limit: ${retentionDays} days)`, async ({
    client,
  }) => {
    const reposApi = new RepositoriesApi(client);
    const snapshotsApi = new SnapshotsApi(client);

    const repos = await reposApi.listRepositories(<ListRepositoriesRequest>{
      origin: 'community,red_hat',
    });
    expect(repos.data).toBeDefined();

    const failedRepos: string[] = [];

    for (const repo of repos.data!) {
      const snaps = await snapshotsApi.listSnapshotsForRepo(<ListSnapshotsForRepoRequest>{
        uuid: repo.uuid,
        sortBy: 'created_at',
        limit: 2,
      });
      expect(snaps.data).toBeDefined();

      // Repo must keep at least 1 snapshot, skip if there's only one
      if (snaps.data!.length === 1) {
        continue;
      }

      const expired: ApiSnapshotResponse[] = [];

      for (const snapshot of snaps.data!) {
        if (snapshot.createdAt) {
          const snapshotDate = new Date(snapshot.createdAt);
          if (snapshotDate < retentionDate) {
            expired.push(snapshot);
          }
        }
      }

      if (expired.length > 0) {
        const expiredDatesList: string[] = [];
        for (const snapshot of expired) {
          if (snapshot.createdAt) {
            expiredDatesList.push(snapshot.createdAt);
          }
        }
        const expiredDates = expiredDatesList.join(', ');
        failedRepos.push(`${repo.name} (created: ${expiredDates})`);
      }
    }

    expect(
      failedRepos.length,
      `Found expired snapshots in ${failedRepos.length} repos:\n${failedRepos.join('\n')}`,
    ).toBe(0);
  });
});
