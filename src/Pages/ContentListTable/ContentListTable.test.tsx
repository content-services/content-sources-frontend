import { render, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import {
  ReactQueryTestWrapper,
  defaultContentItemWithSnapshot,
  defaultSnapshotItem,
  testRepositoryParamsResponse,
} from '../../testingHelpers';
import ContentListTable from './ContentListTable';
import { useContentListQuery, useRepositoryParams } from '../../services/Content/ContentQueries';
import AddContent from './components/AddContent/AddContent';

jest.mock('../../services/Content/ContentQueries', () => ({
  useRepositoryParams: jest.fn(),
  useContentListQuery: jest.fn(),
  useAddContentQuery: () => ({ isLoading: false }),
  useValidateContentList: () => ({ isLoading: false }),
  useDeleteContentItemMutate: () => ({ isLoading: false }),
  useBulkDeleteContentItemMutate: () => ({ isLoading: false }),
  useIntrospectRepositoryMutate: () => ({ isLoading: false }),
  useFetchGpgKey: () => ({ fetchGpgKey: () => '' }),
}));

jest.mock('../../middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('./components/AddContent/AddContent');

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

(AddContent as jest.Mock).mockImplementation(() => 'Add Content');

it('expect ContentListTable to render with a loading skeleton', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No custom repositories')).toBeInTheDocument();
  expect(queryByText('To get started, create a custom repository')).toBeInTheDocument();
});

it('Render a loading state', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: testRepositoryParamsResponse,
  }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: true,
  }));

  const { queryByText, queryByLabelText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Name/URL')).toBeInTheDocument();
  expect(queryByLabelText('Loading')).toBeInTheDocument();
});

it('Render with a single row', () => {
  jest.mock('../../middleware/AppContext', () => ({
    useAppContext: (features) => ({ features: features.snapshot.accessible }),
  }));

  (useRepositoryParams as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: testRepositoryParamsResponse,
  }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultContentItemWithSnapshot],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('AwesomeNamewwyylse12')).toBeInTheDocument();
  expect(queryByText('https://google.ca/wwyylse12/x86_64/el7')).toBeInTheDocument();
  waitFor(() =>
    expect(queryByText(dayjs(defaultSnapshotItem.created_at).fromNow())).toBeInTheDocument(),
  );
  waitFor(() =>
    expect(
      queryByText(
        (
          (defaultSnapshotItem.added_counts['rpm.package'] as number) +
          (defaultSnapshotItem.added_counts['rpm.advisory'] as number)
        )?.toString(),
      ),
    ).toBeInTheDocument(),
  );
  waitFor(() =>
    expect(
      queryByText(
        (
          (defaultSnapshotItem.removed_counts['rpm.package'] as number) +
          (defaultSnapshotItem.removed_counts['rpm.advisory'] as number)
        )?.toString(),
      ),
    ).toBeInTheDocument(),
  );
});
