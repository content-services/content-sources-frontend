import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PackageDetails from './PackageDetails';
import {
  useLightwellRepositoryPackagesQuery,
  usePackageDetailQuery,
} from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultLightwellRepositoryPackageItem,
  defaultLightwellRepositoryPackageResponse,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { RepositoryPackageItem } from 'services/Content/ContentApi';
import { getRepositoryPathSlug } from '../helpers';
import useLightwellRepository from '../useLightwellRepository';

jest.mock('services/Content/ContentQueries', () => ({
  useLightwellRepositoryPackagesQuery: jest.fn(),
  usePackageDetailQuery: jest.fn(),
  usePackageVersionsPreload: jest.fn(() => []),
}));

jest.mock('../useLightwellRepository');

const defaultRepoSlug = getRepositoryPathSlug(
  defaultLightwellContentItem.content_type,
  defaultLightwellContentItem.security_level,
);

const packageName = defaultLightwellRepositoryPackageItem.name;

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

const defaultBuilds = [
  { version: '3.14.0.rhlw-00001', release: 'rhlw-00001', created_at: '2026-07-01T00:00:00Z' },
];

const multiVersionReleasePackage: RepositoryPackageItem = {
  group: 'org.json.test',
  name: 'json-test',
  versions: ['3.14.0', '2.12.0'],
  latest_releases: [
    { version: '3.14.0', release: 'rhlw-00001', created_at: '2026-07-01T00:00:00Z' },
    { version: '2.12.0', release: 'rhlw-00002', created_at: '2026-06-18T00:00:00Z' },
  ],
};

const multiVersionNoReleasePackage: RepositoryPackageItem = {
  group: 'org.json.test',
  name: 'json-test',
  versions: ['2.21.2', '2.20.0', '2.19.1'],
  latest_releases: [
    { version: '2.21.2', release: '', created_at: '2026-07-01T00:00:00Z' },
    { version: '2.20.0', release: '', created_at: '2026-06-15T00:00:00Z' },
    { version: '2.19.1', release: '', created_at: '2026-06-01T00:00:00Z' },
  ],
};

const noReleaseBuilds = [{ version: '2.21.2', release: '', created_at: '2026-07-01T00:00:00Z' }];

const mockPackageDetailQuery = (builds = defaultBuilds) => ({
  isLoading: false,
  isFetching: false,
  data: {
    group: defaultLightwellRepositoryPackageItem.group,
    name: defaultLightwellRepositoryPackageItem.name,
    version: '3.14.0',
    builds,
  },
});

const mockPackagesQuery = () => ({
  isLoading: false,
  isFetching: false,
  data: {
    ...defaultLightwellRepositoryPackageResponse,
    results: [defaultLightwellRepositoryPackageItem],
    total: 1,
  },
});

const renderPackageDetails = () =>
  render(
    <ReactQueryTestWrapper>
      <PackageDetails />
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  mockUseParams.mockReturnValue({
    repoUUID: defaultRepoSlug,
    packageName,
  });
  (useLightwellRepository as jest.Mock).mockReturnValue({
    repository: defaultLightwellContentItem,
    repoUUID: defaultLightwellContentItem.uuid,
    isLoading: false,
    isError: false,
    error: undefined,
  });
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(mockPackagesQuery);
  (usePackageDetailQuery as jest.Mock).mockImplementation(() => mockPackageDetailQuery());
});

it('shows empty state when the package has no builds', async () => {
  (usePackageDetailQuery as jest.Mock).mockImplementation(() => mockPackageDetailQuery([]));

  renderPackageDetails();

  expect(await screen.findByText('No details available yet for this package.')).toBeInTheDocument();
});

const setupNoReleasePackage = () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: {
      ...defaultLightwellRepositoryPackageResponse,
      results: [multiVersionNoReleasePackage],
      total: 1,
    },
  }));
  (usePackageDetailQuery as jest.Mock).mockImplementation(() =>
    mockPackageDetailQuery(noReleaseBuilds),
  );
};

it('does not show Releases tab when package has no release', async () => {
  setupNoReleasePackage();

  renderPackageDetails();

  expect(await screen.findByText('Overview')).toBeInTheDocument();
  expect(screen.queryByText('Releases')).not.toBeInTheDocument();
});

it('renders package detail content with builds', async () => {
  renderPackageDetails();

  expect(await screen.findByRole('heading', { name: packageName })).toBeInTheDocument();
  expect(await screen.findByText('Overview')).toBeInTheDocument();
  expect(await screen.findByText('Releases')).toBeInTheDocument();
  expect(await screen.findByText('About this package')).toBeInTheDocument();
  expect(await screen.findByText('How to use')).toBeInTheDocument();
});

it('renders sidebar metadata', async () => {
  renderPackageDetails();

  expect(await screen.findByText('Last updated')).toBeInTheDocument();
  expect(await screen.findAllByText('2026-07-01')).toHaveLength(2);
  expect(await screen.findByText('Namespace')).toBeInTheDocument();
  expect(await screen.findByText(defaultLightwellRepositoryPackageItem.group)).toBeInTheDocument();
  expect(await screen.findByText('Rebuilt by')).toBeInTheDocument();
  expect(await screen.findByText('Red Hat')).toBeInTheDocument();
});

it('shows Versions tab for non-release packages', async () => {
  setupNoReleasePackage();

  renderPackageDetails();

  expect(await screen.findByText('Versions')).toBeInTheDocument();
  expect(screen.queryByText('Releases')).not.toBeInTheDocument();
});

it('shows version selector dropdown for non-release packages', async () => {
  setupNoReleasePackage();

  renderPackageDetails();

  const toggle = await screen.findByRole('button', { name: '2.21.2' });
  expect(toggle).toBeInTheDocument();
  expect(toggle.classList.contains('pf-v6-c-menu-toggle')).toBe(true);

  await userEvent.click(toggle);

  const menuItems = await screen.findAllByRole('menuitem');
  expect(menuItems).toHaveLength(3);
});

it('shows non-release description text', async () => {
  setupNoReleasePackage();

  renderPackageDetails();

  expect(
    await screen.findByText(/rebuilt from source by Red Hat with no modifications/),
  ).toBeInTheDocument();
});

it('shows upstream versions list in sidebar for non-release packages', async () => {
  setupNoReleasePackage();

  renderPackageDetails();

  expect(await screen.findByText('Upstream versions')).toBeInTheDocument();
  expect(await screen.findByText('2.21.2, 2.20.0, 2.19.1')).toBeInTheDocument();
});

const setupMultiVersionReleasePackage = () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: {
      ...defaultLightwellRepositoryPackageResponse,
      results: [multiVersionReleasePackage],
      total: 1,
    },
  }));
  (usePackageDetailQuery as jest.Mock).mockImplementation(() => mockPackageDetailQuery());
};

it('shows "Other available versions" on Releases tab for multi-version release packages', async () => {
  setupMultiVersionReleasePackage();

  renderPackageDetails();

  const releasesTab = await screen.findByRole('tab', { name: 'Releases' });
  await userEvent.click(releasesTab);

  expect(await screen.findByText('Other available versions')).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: '2.12.0' })).toBeInTheDocument();
  expect(await screen.findByText('rhlw-00002')).toBeInTheDocument();
  expect(await screen.findByText('2026-06-18')).toBeInTheDocument();
});

it('shows version dropdown for multi-version release packages', async () => {
  setupMultiVersionReleasePackage();

  renderPackageDetails();

  const toggle = await screen.findByRole('button', { name: '3.14.0' });
  expect(toggle).toBeInTheDocument();

  await userEvent.click(toggle);

  const menuItems = await screen.findAllByRole('menuitem');
  expect(menuItems).toHaveLength(2);
});
