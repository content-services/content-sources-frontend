import { render, screen } from '@testing-library/react';

import RepositoriesTable from './RepositoriesTable';
import { useContentListQuery } from 'services/Content/ContentQueries';
import { defaultLightwellContentItem, ReactQueryTestWrapper } from 'testingHelpers';

jest.mock('services/Content/ContentQueries', () => ({
  useContentListQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

const renderRepositoriesTable = () =>
  render(
    <ReactQueryTestWrapper>
      <RepositoriesTable />
    </ReactQueryTestWrapper>,
  );

it('shows empty state when there are no repositories', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  renderRepositoriesTable();

  expect(await screen.findByText('Lightwell members only')).toBeInTheDocument();
});

it('renders with a single row', async () => {
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
      'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    ),
  ).toBeInTheDocument();
  expect(await screen.findByText('Java (Maven)')).toBeInTheDocument();
  expect(
    await screen.findByText(defaultLightwellContentItem.package_count.toLocaleString()),
  ).toBeInTheDocument();
});
