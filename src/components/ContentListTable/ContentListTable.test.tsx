import { render } from '@testing-library/react';
import { ReactQueryTestWrapper, testRepositoryParamsResponse } from '../../testingHelpers';
import ContentListTable from './ContentListTable';
import {
  useAddContentQuery,
  useContentListQuery,
  useDeleteContentItemMutate,
  useRepositoryParams,
  useValidateContentList,
} from '../../services/Content/ContentQueries';

jest.mock('../../services/Content/ContentQueries', () => ({
  useRepositoryParams: jest.fn(),
  useContentListQuery: jest.fn(),
  useAddContentQuery: jest.fn(),
  useValidateContentList: jest.fn(),
  useDeleteContentItemMutate: jest.fn(),
}));

it('expect ContentListTable to render with a loading skeleton', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useAddContentQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useValidateContentList as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useDeleteContentItemMutate as jest.Mock).mockImplementation(() => ({ isLoading: false }));

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
  (useAddContentQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useValidateContentList as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useDeleteContentItemMutate as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  const { queryByText, queryByLabelText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Name/URL')).toBeInTheDocument();
  expect(queryByLabelText('Loading')).toBeInTheDocument();
});

it('Render with a single row', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: testRepositoryParamsResponse,
  }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [
        {
          account_id: 'undefined',
          distribution_arch: 'x86_64',
          distribution_versions: ['el7'],
          name: 'AwesomeNamewwyylse12',
          org_id: '13446804',
          url: 'https://google.ca/wwyylse12/x86_64/el7',
          uuid: '2375c35b-a67a-4ac2-a989-21139433c172',
          package_count: 0,
        },
      ],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));
  (useAddContentQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useValidateContentList as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useDeleteContentItemMutate as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('AwesomeNamewwyylse12')).toBeInTheDocument();
  expect(queryByText('https://google.ca/wwyylse12/x86_64/el7')).toBeInTheDocument();
});
