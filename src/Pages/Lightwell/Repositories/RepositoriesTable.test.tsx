import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RepositoriesTable from './RepositoriesTable';
import { useContentListQuery } from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultPythonRemediatedContentItem,
  defaultPythonValidatedContentItem,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { ContentItem } from 'services/Content/ContentApi';
import { getRepositoryPathSlug } from '../helpers';
import { useLightwellNavigateTo } from '../../../Hooks/Lightwell/navigation/useLightwellNavigateTo';
import { useAppContext } from 'middleware/AppContext';
import { useIsOrgAdmin } from 'Hooks/Lightwell/useIsOrgAdmin';

jest.mock('services/Content/ContentQueries', () => ({
  useContentListQuery: jest.fn(),
  useLightwellRepositoryPackageCountsQuery: jest.fn(),
}));

const mockNavigateTo = jest.fn();

jest.mock('Hooks/Lightwell/navigation/useLightwellNavigateTo', () => ({
  useLightwellNavigateTo: jest.fn(),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('Hooks/Lightwell/useIsOrgAdmin', () => ({
  useIsOrgAdmin: jest.fn(),
  canManageLightwellTokens: jest.requireActual('Hooks/Lightwell/useIsOrgAdmin')
    .canManageLightwellTokens,
  canViewLightwellPackages: jest.requireActual('Hooks/Lightwell/useIsOrgAdmin')
    .canViewLightwellPackages,
}));

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  LIGHTWELL_USE_MOCK: false,
}));

const javaRemediatedContentItem: ContentItem = {
  ...defaultLightwellContentItem,
  name: 'lightwell/java/remediated',
  published_distribution_url: 'https://example.com/lightwell/java/remediated',
  uuid: '3875c35b-a67a-4ac2-a989-21139433c178',
  security_level: 'remediated',
  package_count: 11,
  build_count: 28,
  version_count: 28,
};

const renderRepositoriesTable = () =>
  render(
    <ReactQueryTestWrapper>
      <RepositoriesTable />
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  mockNavigateTo.mockClear();
  (useLightwellNavigateTo as jest.Mock).mockReturnValue({
    navigateTo: mockNavigateTo,
  });
  (useAppContext as jest.Mock).mockReturnValue({
    features: { lightwell: { enabled: true, accessible: true } },
  });
  (useIsOrgAdmin as jest.Mock).mockReturnValue({ isOrgAdmin: false, isLoading: false });
});

it('shows empty state when there are no repositories', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  renderRepositoriesTable();

  expect(await screen.findByText('Lightwell members only')).toBeInTheDocument();
});

it('renders with a single repository', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Validated')).toBeInTheDocument();
  expect(
    await screen.findByText(
      'Maven artifacts rebuilt from source by Red Hat. Verified end-to-end with no modifications.',
    ),
  ).toBeInTheDocument();
  expect(await screen.findByText('Java (Maven)')).toBeInTheDocument();
  expect(await screen.findByText('1')).toBeInTheDocument();
  expect(await screen.findByText('3')).toBeInTheDocument();
});

it('shows a loading skeleton while repositories are loading', () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: true }));

  renderRepositoriesTable();

  expect(
    screen.getByText('Browse Lightwell repositories by ecosystem and security level.'),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('table', { name: 'Lightwell repositories table' }),
  ).not.toBeInTheDocument();
});

it('navigates to repository packages when a repository name is clicked', async () => {
  (useIsOrgAdmin as jest.Mock).mockReturnValue({ isOrgAdmin: true, isLoading: false });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await userEvent.click(await screen.findByRole('button', { name: 'Java Validated' }));

  expect(mockNavigateTo).toHaveBeenCalledWith('repositoryPackages', {
    repoSlug: getRepositoryPathSlug(
      defaultLightwellContentItem.content_type,
      defaultLightwellContentItem.security_level,
    ),
  });
});

it('does not link repository names for non-org-admins', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Validated')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Java Validated' })).not.toBeInTheDocument();
});

it('renders java remediated repository with remediated description', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [javaRemediatedContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Remediated')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('11')).toBeInTheDocument();
  expect(screen.getByText('28')).toBeInTheDocument();
});

it('renders python validated repository with python ecosystem label', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultPythonValidatedContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Python Validated')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Python wheels rebuilt from source by Red Hat. Verified end-to-end with no modifications.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('Python (PyPI)')).toBeInTheDocument();
});

it('renders connect action for each repository', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Connect to this repository')).toBeInTheDocument();
});

it('renders validated and remediated security level labels', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem, defaultPythonRemediatedContentItem],
      meta: { count: 2, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Validated')).toBeInTheDocument();
  expect(screen.getByText('Remediated')).toBeInTheDocument();
});

it('renders repository table column headers', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByRole('columnheader', { name: 'Repository' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Ecosystem' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Security level' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Packages' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Versions' })).toBeInTheDocument();
});

it('shows access tokens button for org admins with lightwell feature', async () => {
  (useIsOrgAdmin as jest.Mock).mockReturnValue({ isOrgAdmin: true, isLoading: false });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await userEvent.click(await screen.findByRole('button', { name: 'Access tokens' }));
  expect(mockNavigateTo).toHaveBeenCalledWith('tokens');
});

it('hides access tokens button for non-admins', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Validated')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Access tokens' })).not.toBeInTheDocument();
});
