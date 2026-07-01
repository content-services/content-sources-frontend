export type LightwellPackage = {
  group_id: string;
  name: string;
  versions: string[];
  latest_releases: string[];
  last_updated: string;
};

const mockPackagesByRepository: Record<string, LightwellPackage[]> = {
  '33333333-3333-4333-8333-333333333333': [
    {
      name: 'python-requests',
      group_id: '',
      versions: ['2.32.3', '2.32.4'],
      latest_releases: ['rhlw-3001'],
      last_updated: '2026-07-01',
    },
    {
      name: 'python-urllib3',
      versions: ['2.2.2'],
      latest_releases: ['rhlw-3002'],
      last_updated: '2026-07-01',
      group_id: '',
    },
  ],
  '11111111-1111-4111-8111-111111111111': [
    {
      name: 'commons-fileupload',
      group_id: 'commons-fileupload',
      versions: ['2.17.1'],
      latest_releases: ['rhlw-3003'],
      last_updated: '2026-07-01',
    },
    {
      name: 'json',
      group_id: 'org.json',
      versions: ['3.14.0'],
      latest_releases: ['rhlw-3004'],
      last_updated: '2026-07-01',
    },
    {
      name: 'httpclient',
      group_id: 'org.apache.httpcomponents',
      versions: ['32.1.3'],
      latest_releases: ['rhlw-3005'],
      last_updated: '2026-07-01',
    },
  ],
  '22222222-2222-4222-8222-222222222222': [
    {
      name: 'json',
      group_id: 'org.json',
      versions: ['20220320.0.0'],
      latest_releases: ['20220320.0.0.rhlw-00001'],
      last_updated: '2026-07-01',
    },
    {
      name: 'json-path',
      group_id: 'com.jayway.jsonpath',
      versions: ['2.8.0', '2.7.0'],
      latest_releases: ['2.8.0.rhlw-00001', '2.7.0.rhlw-00001'],
      last_updated: '2026-07-01',
    },
    {
      name: 'json-smart',
      group_id: 'net.minidev',
      versions: ['2.5.0', '2.4.8'],
      latest_releases: ['2.5.0.rhlw-00001', '2.4.8.rhlw-00001'],
      last_updated: '2026-07-01',
    },
  ],
};

export const getMockLightwellPackages = (repoUUID: string, search = ''): LightwellPackage[] => {
  const normalizedUuid = decodeURIComponent(repoUUID);
  const packages = mockPackagesByRepository[normalizedUuid] ?? [];
  const query = search.trim().toLowerCase();

  const filtered = query
    ? packages.filter((pkg) => pkg.name.toLowerCase().includes(query))
    : packages;

  return filtered;
};
