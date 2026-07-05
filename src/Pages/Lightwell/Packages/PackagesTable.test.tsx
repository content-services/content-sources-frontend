import { render, screen } from '@testing-library/react';

import PackagesTable from './PackagesTable';
import { useLightwellRepositoryPackagesQuery } from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultLightwellRepositoryPackageItem,
  defaultLightwellRepositoryPackageResponse,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { getRepositoryPathSlug } from '../helpers';
import useLightwellRepository from '../useLightwellRepository';

jest.mock('services/Content/ContentQueries', () => ({
  useLightwellRepositoryPackagesQuery: jest.fn(),
}));

jest.mock('../useLightwellRepository');

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

beforeEach(() => {
  (useLightwellRepository as jest.Mock).mockReturnValue({
    repository: defaultLightwellContentItem,
    repoUUID: defaultLightwellContentItem.uuid,
    isLoading: false,
    isError: false,
    error: undefined,
  });
});

it('shows empty state when there are no packages', async () => {
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
