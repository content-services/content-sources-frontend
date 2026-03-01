import { render } from '@testing-library/react';
import { useCustomRepositoriesApi } from '../store/CustomRepositoriesStore';
import { defaultContentItem, defaultTemplateItem } from 'testingHelpers';
import CustomRepositoriesStep from './CustomRepositoriesStep';

jest.mock(
  '@src/features/createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore',
  () => ({
    useCustomRepositoriesApi: jest.fn(),
  }),
);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
  useHref: () => 'insights/content/templates',
}));

it('expect CustomRepositoriesStep to render correctly', () => {
  const mockRedhatRepositoriesApi = {
    selectedCustomRepos: new Set([defaultTemplateItem.uuid]),
    contentList: [defaultContentItem],
    pathname: '',
    columnHeaders: ['Name', 'Status', 'Packages'],
    page: 1,
    perPage: 20,
    count: 1,
    isLoading: false,
    isFetching: false,
    searchQuery: '',
    toggled: false,
    showLoader: false,
    onSetPage: () => {},
    onPerPageSelect: () => {},
    sortParams: () => undefined,
    setSearchQuery: () => {},
    setUUIDForList: () => {},
    setToggled: () => {},
  };

  (useCustomRepositoriesApi as jest.Mock).mockImplementation(() => mockRedhatRepositoriesApi);

  const { getByRole, getByText } = render(<CustomRepositoriesStep />);

  const firstCheckboxInList = getByRole('checkbox', { name: 'Select row 0' });

  expect(firstCheckboxInList).toBeInTheDocument();
  expect(firstCheckboxInList).toBeDisabled();

  expect(getByText(defaultContentItem.name)).toBeInTheDocument();
  expect(getByText(defaultContentItem.package_count + '')).toBeInTheDocument();
});
