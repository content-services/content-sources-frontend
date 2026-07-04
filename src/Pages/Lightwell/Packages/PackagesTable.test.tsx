import { render, screen } from '@testing-library/react';

import PackagesTable from './PackagesTable';
import {
  useFetchContent,
  useLightwellRepositoryPackagesQuery,
} from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultLightwellRepositoryPackageItem,
  defaultLightwellRepositoryPackageResponse,
  ReactQueryTestWrapper,
} from 'testingHelpers';

jest.mock('services/Content/ContentQueries', () => ({
  useFetchContent: jest.fn(),
  useLightwellRepositoryPackagesQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: defaultLightwellContentItem.uuid,
  }),
  useMatch: () => ({ pathnameBase: '/lightwell' }),
}));

jest.mock('../../../Hooks/useLightwellNavigate', () => ({
  useLightwellNavigate: () => ({
    goToRepositories: jest.fn(),
    goToPackageDetails: jest.fn(),
  }),
}));

const renderPackagesTable = () =>
  render(
    <ReactQueryTestWrapper>
      <PackagesTable />
    </ReactQueryTestWrapper>,
  );

it('shows empty state when there are no packages', async () => {
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
