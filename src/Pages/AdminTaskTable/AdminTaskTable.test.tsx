import { render } from '@testing-library/react';
import { ReactQueryTestWrapper, defaultIntrospectTask } from '../../testingHelpers';
import AdminTaskTable, { formatDate } from './AdminTaskTable';
import { useAdminTaskListQuery } from '../../services/AdminTasks/AdminTaskQueries';

jest.mock('../../services/AdminTasks/AdminTaskQueries', () => ({
  useAdminTaskListQuery: jest.fn(),
  useFetchAdminTaskQuery: () => ({ fetchAdminTask: () => undefined, isLoading: false }),
}));

jest.mock('../../middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

it('expect AdminTaskTable to render with a loading skeleton', () => {
  (useAdminTaskListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <AdminTaskTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No tasks')).toBeInTheDocument();
});

it('Render a loading state', () => {
  (useAdminTaskListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: true,
  }));

  const { queryByText, queryByLabelText } = render(
    <ReactQueryTestWrapper>
      <AdminTaskTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Account ID')).toBeInTheDocument();
  expect(queryByLabelText('Loading')).toBeInTheDocument();
});

it('Render with a single row', () => {
  (useAdminTaskListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultIntrospectTask],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <AdminTaskTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText(defaultIntrospectTask.account_id)).toBeInTheDocument();
  expect(queryByText(defaultIntrospectTask.org_id)).toBeInTheDocument();
  // Capitalize first letter
  expect(
    queryByText(
      defaultIntrospectTask.status.at(0)?.toUpperCase() + defaultIntrospectTask.status.slice(1),
    ),
  ).toBeInTheDocument();
  expect(queryByText(formatDate(defaultIntrospectTask.queued_at))).toBeInTheDocument();
});
