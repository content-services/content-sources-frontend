import { render, screen } from '@testing-library/react';

import PackageDetails from './PackageDetails';
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

const mockUseParams = jest.fn(() => ({
  repoUUID: defaultLightwellContentItem.uuid,
  packageName: 'missing-package',
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => mockUseParams(),
}));

jest.mock('../../../Hooks/useLightwellNavigate', () => ({
  useLightwellNavigate: () => ({
    goToRepositories: jest.fn(),
    goToRepositoryPackages: jest.fn(),
  }),
}));

const renderPackageDetails = () =>
  render(
    <ReactQueryTestWrapper>
      <PackageDetails />
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  mockUseParams.mockReturnValue({
    repoUUID: defaultLightwellContentItem.uuid,
    packageName: 'missing-package',
  });
});

it('shows empty state', async () => {
  mockUseParams.mockReturnValue({
    repoUUID: defaultLightwellContentItem.uuid,
    packageName: defaultLightwellRepositoryPackageItem.name,
  });

  (useFetchContent as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: defaultLightwellContentItem,
  }));
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: {
      ...defaultLightwellRepositoryPackageResponse,
      results: [{ ...defaultLightwellRepositoryPackageItem, versions: [], latest_releases: [] }],
    },
  }));

  renderPackageDetails();

  expect(await screen.findByText('No details available yet for this package.')).toBeInTheDocument();
});
