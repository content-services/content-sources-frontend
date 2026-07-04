import { render, screen } from '@testing-library/react';

import PackagesTable from './PackagesTable';
import {
  useContentListQuery,
  useFetchContent,
  useLightwellRepositoryPackagesQuery,
} from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultLightwellRepositoryPackageItem,
  defaultLightwellRepositoryPackageResponse,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { getRepositoryPathSlug } from '../helpers';

jest.mock('services/Content/ContentQueries', () => ({
  useContentListQuery: jest.fn(),
  useFetchContent: jest.fn(),
  useLightwellRepositoryPackagesQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoName: getRepositoryPathSlug(
      defaultLightwellContentItem.content_type,
      defaultLightwellContentItem.security_level,
    ),
  }),
}));

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  LIGHTWELL_USE_MOCK: false,
}));

const renderPackagesTable = () =>
  render(
    <ReactQueryTestWrapper>
      <PackagesTable />
    </ReactQueryTestWrapper>,
  );

const mockRepositoryListQuery = () => ({
  isLoading: false,
  data: {
    data: [defaultLightwellContentItem],
    meta: { count: 1, limit: 100, offset: 0 },
  },
});

it('shows empty state when there are no packages', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => mockRepositoryListQuery());
  (useFetchContent as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: defaultLightwellContentItem,
  }));
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: { ...defaultLightwellRepositoryPackageResponse, results: [], total: 0 },
  }));

  renderPackagesTable();

  expect(
    await screen.findByText('No packages available yet in this repository.'),
  ).toBeInTheDocument();
});

it('renders with a single package', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => mockRepositoryListQuery());
  (useFetchContent as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: defaultLightwellContentItem,
  }));
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: {
      ...defaultLightwellRepositoryPackageResponse,
      results: [defaultLightwellRepositoryPackageItem],
      total: 1,
    },
  }));

  renderPackagesTable();

  expect(screen.queryAllByText('Java Validated')).toHaveLength(2);
  expect(await screen.findByLabelText('Repository URL')).toHaveTextContent(
    'https://example.com/lightwell/java/validated',
  );
  expect(await screen.findByText('org.json.test')).toBeInTheDocument();
  expect(screen.queryByText('rhlw-3004-test')).not.toBeInTheDocument();
  expect(await screen.findByLabelText('Copy 3.14.0')).toHaveTextContent('3.14.0');
  expect(await screen.findByText('2026-07-01')).toBeInTheDocument();
});
