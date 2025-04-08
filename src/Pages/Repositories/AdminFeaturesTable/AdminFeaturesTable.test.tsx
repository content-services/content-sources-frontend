import { render } from '@testing-library/react';
import { ReactQueryTestWrapper } from 'testingHelpers';
import AdminFeaturesTable from './AdminFeaturesTable';
import userEvent from '@testing-library/user-event';
import { useFetchAdminFeatureQuery } from 'services/Admin/AdminQueries';

const mockFeatureData = new Array(9).fill('').map((_, index) => ({
  name: 'test_' + index,
  url: 'http://test.com_' + index,
  red_hat_repo_structure: {
    name: 'test_' + index,
    content_label: 'label_' + index,
    url: 'http://test.com_' + index,
    arch: 'arch_' + index,
    distribution_version: 'version_' + index,
    feature_name: 'test_' + index,
  },
}));

jest.mock('services/Admin/AdminQueries', () => ({
  useAdminFeatureListQuery: () => ({
    isLoading: false,
    isFetching: false,
    data: {
      features: ['test', 'test2', 'test3'],
    },
    isError: false,
  }),
  useFetchAdminFeatureQuery: jest.fn(),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

jest.mock('Hooks/useRootPath', () => () => 'BasePath');
jest.mock('Hooks/useDebounce', () => (val) => val);

it('AdminFeaturesTable to render, select item, and copy', async () => {
  (useFetchAdminFeatureQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: mockFeatureData,
  }));
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(''),
    },
  });
  sessionStorage.setItem('feature', 'test');
  const { queryByText, getByRole } = render(
    <ReactQueryTestWrapper>
      <AdminFeaturesTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('http://test.com_8')).toBeInTheDocument();
  const checkbox8Locator = getByRole('checkbox', { name: 'Select row 8' });
  expect(checkbox8Locator).toBeInTheDocument();
  await userEvent.click(checkbox8Locator);
  expect(checkbox8Locator).toBeChecked();

  const copyButton = getByRole('button', { name: '1 items selected to copy' });
  expect(copyButton).toBeInTheDocument();
  await userEvent.click(copyButton);

  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
    '[{"name":"test_8","content_label":"label_8","url":"http://test.com_8","arch":"arch_8","distribution_version":"version_8","feature_name":"test_8"}]',
  );
});

it('Render an empty state', () => {
  (useFetchAdminFeatureQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    data: [],
  }));
  sessionStorage.setItem('feature', 'test');

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <AdminFeaturesTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No features found.')).toBeInTheDocument();
  expect(queryByText('No data was found for this feature.')).toBeInTheDocument();
});
