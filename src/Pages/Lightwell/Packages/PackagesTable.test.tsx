import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

import PackagesTable from './PackagesTable';
import { useLightwellRepositoryPackagesQuery } from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultLightwellRepositoryPackageItem,
  defaultLightwellRepositoryPackageResponse,
  defaultPythonRemediatedContentItem,
  defaultPythonRemediatedRepositoryPackageItem,
  defaultPythonValidatedContentItem,
  defaultPythonValidatedPackageItem,
  pythonValidatedPipCommand,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { ContentItem } from 'services/Content/ContentApi';
import { getRepositoryPathSlug } from '../helpers';
import useLightwellRepository from '../useLightwellRepository';

jest.mock('services/Content/ContentQueries', () => ({
  useLightwellRepositoryPackagesQuery: jest.fn(),
}));

jest.mock('../useLightwellRepository');

jest.mock('Hooks/useDebounce', () => (value: unknown) => value);

const mockNavigate = jest.fn();

const mockUseParams = jest.fn(() => ({
  repoName: getRepositoryPathSlug(
    defaultLightwellContentItem.content_type,
    defaultLightwellContentItem.security_level,
  ),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => mockUseParams(),
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
};

const mockPackagesQuery = (
  overrides: Partial<ReturnType<typeof useLightwellRepositoryPackagesQuery>> = {},
) => ({
  isLoading: false,
  isFetching: false,
  isError: false,
  error: undefined,
  data: defaultLightwellRepositoryPackageResponse,
  ...overrides,
});

const mockRepository = (repository: ContentItem = defaultLightwellContentItem) => {
  (useLightwellRepository as jest.Mock).mockReturnValue({
    repository,
    repoUUID: repository.uuid,
    isLoading: false,
    isError: false,
    error: undefined,
  });
};

const renderPackagesTable = () =>
  render(
    <ReactQueryTestWrapper>
      <PackagesTable />
    </ReactQueryTestWrapper>,
  );

const mockClipboard = () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  return writeText;
};

const clickCopyLabel = async (label: string) => {
  const copyLabel = await screen.findByLabelText(label);
  await userEvent.click(copyLabel.querySelector('button')!);
};

const javaValidatedTableCopyCommand = `${defaultLightwellRepositoryPackageItem.group}:${defaultLightwellRepositoryPackageItem.name}:3.14.0`;

beforeEach(() => {
  (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  mockUseParams.mockReturnValue({
    repoName: getRepositoryPathSlug(
      defaultLightwellContentItem.content_type,
      defaultLightwellContentItem.security_level,
    ),
  });
  mockRepository();
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() => mockPackagesQuery());
});

it('shows empty state when there are no packages', async () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: { ...defaultLightwellRepositoryPackageResponse, results: [], total: 0 },
    }),
  );

  renderPackagesTable();

  expect(
    await screen.findByText('No packages available yet in this repository.'),
  ).toBeInTheDocument();
});

it('renders with a single package', async () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: {
        ...defaultLightwellRepositoryPackageResponse,
        results: [defaultLightwellRepositoryPackageItem],
        total: 1,
      },
    }),
  );

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

it('shows a loading skeleton while packages are fetching', () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({ isFetching: true }),
  );

  renderPackagesTable();

  expect(screen.getByLabelText('Filter by name or group ID')).toBeInTheDocument();
  expect(screen.queryByRole('table', { name: 'Lightwell packages table' })).not.toBeInTheDocument();
});

it('shows loader while the repository is resolving', () => {
  (useLightwellRepository as jest.Mock).mockReturnValue({
    repository: undefined,
    repoUUID: undefined,
    isLoading: true,
    isError: false,
    error: undefined,
  });

  renderPackagesTable();

  expect(screen.queryByLabelText('Filter by name or group ID')).not.toBeInTheDocument();
});

it('shows filtered empty state when search returns no packages', async () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: { ...defaultLightwellRepositoryPackageResponse, results: [], total: 0 },
    }),
  );

  renderPackagesTable();

  await userEvent.type(screen.getByLabelText('Filter by name or group ID'), 'missing');

  expect(await screen.findByText('No packages match the filter criteria')).toBeInTheDocument();
  expect(screen.getByText('Clear all filters to show more results.')).toBeInTheDocument();
});

it('navigates to package details when a package name is clicked', async () => {
  renderPackagesTable();

  await userEvent.click(await screen.findByRole('button', { name: 'json-test' }));

  expect(mockNavigate).toHaveBeenCalledWith(
    `${encodeURIComponent(defaultLightwellRepositoryPackageItem.group)}/${encodeURIComponent('json-test')}`,
  );
});

it('copies the maven coordinate when a validated version label is clicked', async () => {
  const writeText = mockClipboard();
  renderPackagesTable();

  await clickCopyLabel('Copy 3.14.0');

  expect(writeText).toHaveBeenCalledWith(javaValidatedTableCopyCommand);
});

it('expands additional versions when "N more" is clicked', async () => {
  mockUseParams.mockReturnValue({
    repoName: getRepositoryPathSlug('python', 'validated'),
  });
  mockRepository(defaultPythonValidatedContentItem);
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: {
        ...defaultLightwellRepositoryPackageResponse,
        results: [defaultPythonValidatedPackageItem],
        total: 1,
      },
    }),
  );

  renderPackagesTable();

  expect(screen.getByText('2.21.2')).toBeInTheDocument();
  expect(screen.queryByText('2.20.0')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: '1 more' }));

  expect(screen.getByText('2.20.0')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'hide' })).toBeInTheDocument();
});

it('renders remediated java packages with a Latest release column', async () => {
  mockUseParams.mockReturnValue({
    repoName: getRepositoryPathSlug('maven', 'remediated'),
  });
  mockRepository(javaRemediatedContentItem);

  renderPackagesTable();

  expect(await screen.findByRole('heading', { name: 'Java Remediated' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Latest release' })).toBeInTheDocument();
  expect(await screen.findByLabelText('Copy 3.14.0.rhlw-0004')).toHaveTextContent(
    '3.14.0.rhlw-0004',
  );
  expect(screen.queryByLabelText('Copy 3.14.0')).not.toBeInTheDocument();
});

it('renders python validated packages with pip copy labels and no group ID column', async () => {
  mockUseParams.mockReturnValue({
    repoName: getRepositoryPathSlug('python', 'validated'),
  });
  mockRepository(defaultPythonValidatedContentItem);
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: {
        ...defaultLightwellRepositoryPackageResponse,
        results: [defaultPythonValidatedPackageItem],
        total: 1,
      },
    }),
  );

  const writeText = mockClipboard();
  renderPackagesTable();

  expect(await screen.findByRole('heading', { name: 'Python Validated' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'Group ID' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'Latest release' })).not.toBeInTheDocument();

  await clickCopyLabel('Copy 2.21.2');
  expect(writeText).toHaveBeenCalledWith(pythonValidatedPipCommand);
});

it('renders python remediated packages with a Latest release column', async () => {
  mockUseParams.mockReturnValue({
    repoName: getRepositoryPathSlug('python', 'remediated'),
  });
  mockRepository(defaultPythonRemediatedContentItem);
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: {
        ...defaultLightwellRepositoryPackageResponse,
        results: [defaultPythonRemediatedRepositoryPackageItem],
        total: 1,
      },
    }),
  );

  renderPackagesTable();

  expect(await screen.findByRole('heading', { name: 'Python Remediated' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Latest release' })).toBeInTheDocument();
  expect(await screen.findByLabelText('Copy 2.32.0.rhlw-0002')).toBeInTheDocument();
});

it('clears the search filter from the filtered empty state', async () => {
  (useLightwellRepositoryPackagesQuery as jest.Mock).mockImplementation(() =>
    mockPackagesQuery({
      data: { ...defaultLightwellRepositoryPackageResponse, results: [], total: 0 },
    }),
  );

  renderPackagesTable();

  await userEvent.type(screen.getByLabelText('Filter by name or group ID'), 'missing');
  expect(await screen.findByText('No packages match the filter criteria')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));

  await waitFor(() => expect(screen.getByLabelText('Filter by name or group ID')).toHaveValue(''));
});

it('renders connect action and repository description', async () => {
  renderPackagesTable();

  expect(await screen.findByRole('button', { name: 'Connect' })).toBeInTheDocument();
  expect(
    screen.getByText(
      'Maven artifacts rebuilt from source by Red Hat. Verified end-to-end with no modifications.',
    ),
  ).toBeInTheDocument();
});
