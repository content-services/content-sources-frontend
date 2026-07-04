import { RepositoryPackageItem } from 'services/Content/ContentApi';

const mockPackagesByRepository: Record<string, RepositoryPackageItem[]> = {
  '33333333-3333-4333-8333-333333333333': [
    {
      name: 'python-requests',
      group: '',
      versions: ['2.32.3', '2.32.4'],
      latest_releases: [
        { version: '2.32.3', release: 'rhlw-3001', created_at: '2026-07-01T00:00:00Z' },
        { version: '2.32.4', release: 'rhlw-3002', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
    {
      name: 'python-urllib3',
      group: '',
      versions: ['2.2.2'],
      latest_releases: [
        { version: '2.2.2', release: 'rhlw-3002', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
  ],
  '11111111-1111-4111-8111-111111111111': [
    {
      name: 'commons-fileupload',
      group: 'commons-fileupload',
      versions: ['2.17.1'],
      latest_releases: [
        { version: '2.17.1', release: 'rhlw-3003', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
    {
      name: 'json',
      group: 'org.json',
      versions: ['3.14.0'],
      latest_releases: [
        { version: '3.14.0', release: 'rhlw-3004', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
    {
      name: 'httpclient',
      group: 'org.apache.httpcomponents',
      versions: ['32.1.3'],
      latest_releases: [
        { version: '32.1.3', release: 'rhlw-3005', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
  ],
  '22222222-2222-4222-8222-222222222222': [
    {
      name: 'json',
      group: 'org.json',
      versions: ['20220320.0.0'],
      latest_releases: [
        {
          version: '20220320.0.0',
          release: '20220320.0.0.rhlw-00001',
          created_at: '2026-07-01T00:00:00Z',
        },
      ],
    },
    {
      name: 'json-path',
      group: 'com.jayway.jsonpath',
      versions: ['2.8.0', '2.7.0'],
      latest_releases: [
        { version: '2.8.0', release: '2.8.0.rhlw-00001', created_at: '2026-07-01T00:00:00Z' },
        { version: '2.7.0', release: '2.7.0.rhlw-00001', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
    {
      name: 'json-smart',
      group: 'net.minidev',
      versions: ['2.5.0', '2.4.8'],
      latest_releases: [
        { version: '2.5.0', release: '2.5.0.rhlw-00001', created_at: '2026-07-01T00:00:00Z' },
        { version: '2.4.8', release: '2.4.8.rhlw-00001', created_at: '2026-07-01T00:00:00Z' },
      ],
    },
  ],
};

export const getMockLightwellPackages = (
  repoUUID: string,
  search = '',
): RepositoryPackageItem[] => {
  const normalizedUuid = decodeURIComponent(repoUUID);
  const packages = mockPackagesByRepository[normalizedUuid] ?? [];
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return packages;
  }

  return packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(normalizedSearch) ||
      pkg.group.toLowerCase().includes(normalizedSearch),
  );
};

export const getMockLightwellRepositoryPackageCounts = (
  repoUuids: string[],
): Record<string, number> =>
  Object.fromEntries(repoUuids.map((uuid) => [uuid, getMockLightwellPackages(uuid).length]));
