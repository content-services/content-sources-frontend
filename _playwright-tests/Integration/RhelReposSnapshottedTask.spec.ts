import { test, expect, RepositoriesApi } from 'test-utils';

test.describe('Check RHEL repos have hourly snapshot tasks', () => {
  test('Verify RHEL repos have a snapshot task queued within the last 60 minutes', async ({
    client,
  }) => {
    const repositoriesApi = new RepositoriesApi(client);
    const now = Date.now();
    const sixtyMinutesAgo = new Date(now - 60 * 60 * 1000);

    await test.step('Get RHEL repositories', async () => {
      const rhelRepos = (
        await repositoriesApi.listRepositories({
          origin: 'red_hat',
        })
      ).data;
      expect(rhelRepos!.length).toBeGreaterThan(0);

      const failures: string[] = [];

      for (const repo of rhelRepos!) {
        const createdAt = repo.lastSnapshotTask?.createdAt;
        const ageMinutes =
          createdAt !== undefined ? (now - new Date(createdAt).getTime()) / 60000 : undefined;

        if (createdAt === undefined) {
          const message = `Repository "${repo.name}" (UUID: ${repo.uuid}) has no lastSnapshotTask`;
          failures.push(message);
          console.log(`FAIL: ${message}`);
          continue;
        }

        const taskQueuedAt = new Date(createdAt);
        const timestamp = taskQueuedAt.getTime();

        if (isNaN(timestamp)) {
          const message = `Repository "${repo.name}" (UUID: ${repo.uuid}) has invalid lastSnapshotTask.createdAt: ${createdAt}`;
          failures.push(message);
          console.log(`FAIL: ${message}`);
          continue;
        }

        const ageLabel = ageMinutes !== undefined ? `${ageMinutes.toFixed(2)} minutes` : 'unknown';
        const statusLine = `Repo: ${repo.name}, Current time: ${new Date(now).toISOString()}, Task queued at: ${taskQueuedAt.toISOString()}, Age: ${ageLabel}`;

        if (taskQueuedAt < sixtyMinutesAgo) {
          const message = `${statusLine} snapshot task is older than 60 minutes`;
          failures.push(message);
          console.log(`FAIL: ${message}`);
        } else {
          console.log(`PASS: ${statusLine}`);
        }
      }

      if (failures.length > 0) {
        throw new Error(
          `${failures.length} RHEL repos failed snapshot task validation:\n` +
            failures.map((msg) => `  - ${msg}`).join('\n'),
        );
      }
    });
  });
});
