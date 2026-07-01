import { ContentItem, ContentListResponse, FilterData } from 'services/Content/ContentApi';

const mockRepositories = [
  {
    uuid: '11111111-1111-4111-8111-111111111111',
    name: 'lightwell/java/validated',
    url: 'https://example.com/lightwell/java/validated',
    description:
      'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    security_level: 'Validated',
    content_type: 'maven',
    package_count: 1284,
    last_introspection_status: 'Valid',
    builds: 12,
  },
  {
    uuid: '22222222-2222-4222-8222-222222222222',
    name: 'lightwell/java/remediated',
    url: 'https://example.com/lightwell/java/remediated',
    description:
      'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    security_level: 'Remediated',
    content_type: 'maven',
    package_count: 892,
    last_introspection_status: 'Valid',
    builds: 122,
  },
  {
    uuid: '33333333-3333-4333-8333-333333333333',
    name: 'lightwell/python/remediated',
    url: 'https://example.com/lightwell/python/remediated',
    description:
      'Python wheels with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    security_level: 'Remediated',
    content_type: 'pypi',
    package_count: 456,
    last_introspection_status: 'Valid',
    builds: 59,
  },
  {
    uuid: '44444444-4444-4444-8444-444444444444',
    name: 'lightwell/python/validated',
    url: 'https://example.com/lightwell/python/validated',
    description:
      'Python wheels with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    security_level: 'Validated',
    content_type: 'pypi',
    package_count: 1045,
    last_introspection_status: 'Valid',
    builds: 234,
  },
] as ContentItem[];

export const getMockLightwellRepository = (uuid: string): ContentItem | undefined => {
  const normalizedUuid = decodeURIComponent(uuid);
  return mockRepositories.find((repo) => repo.uuid === normalizedUuid);
};

export const getMockLightwellRepositoryList = (
  page: number,
  perPage: number,
  filters: FilterData,
): ContentListResponse => {
  const search = (filters.search ?? '').trim().toLowerCase();

  let filtered = mockRepositories;

  if (search) {
    filtered = filtered.filter((repo) => repo.name.toLowerCase().includes(search));
  }

  const offset = (page - 1) * perPage;
  const data = filtered.slice(offset, offset + perPage);

  return {
    data,
    links: { first: '', last: '' },
    meta: {
      count: filtered.length,
      limit: perPage,
      offset,
    },
  };
};
