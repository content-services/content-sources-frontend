import { render } from '@testing-library/react';
import { defaultContentItem } from 'testingHelpers';
import OtherRepositories from './OtherRepositories';
import {
  useOtherRepositoriesApi,
  useOtherRepositoriesState,
  usePaginationState,
  useSort,
} from '../store/OtherRepositoriesStore';

jest.mock(
  '@src/Pages/Templates/TemplatesTable/components/CreateTemplate/steps/OtherRepositories/store/OtherRepositoriesStore.tsx',
  () => ({
    useOtherRepositoriesState: jest.fn(),
    useOtherRepositoriesApi: jest.fn(),
    usePaginationState: jest.fn(),
    useSort: jest.fn(),
  }),
);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
  useHref: () => 'insights/content/templates',
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: jest.fn(),
}));

it('expect Other Repositories to render correctly', () => {
  const mockOtherReposState = {
    isLoading: false,
    isFetching: false,
    count: 1,
    filterQuery: '',
    isSelectedFiltered: false,
    repositoriesList: [defaultContentItem],
    areOtherReposToSelect: true,
    nootherReposSelected: true,
    isInOtherUUIDs: (uuid) => otherUUIDs.includes(uuid),
  };

  const otherUUIDs = [defaultContentItem.uuid];

  const mockOtherReposApi = {
    filterByName: () => {},
    filterSelected: () => {},
    turnPage: () => {},
    setPagination: () => {},
    toggleChecked: () => {},
    refetchOtherRepositories: () => {},
  };
  const mockPaginationState = { page: 1, perPage: 20 };
  const mockSort = { setSortProps: () => {} };

  (useOtherRepositoriesState as jest.Mock).mockImplementation(() => mockOtherReposState);
  (useOtherRepositoriesApi as jest.Mock).mockImplementation(() => mockOtherReposApi);
  (usePaginationState as jest.Mock).mockImplementation(() => mockPaginationState);
  (useSort as jest.Mock).mockImplementation(() => mockSort);

  const { getByRole, getByText } = render(<OtherRepositories />);

  const firstCheckboxInList = getByRole('checkbox', { name: 'Select row 0' });

  expect(firstCheckboxInList).toBeInTheDocument();
  expect(firstCheckboxInList).toBeDisabled();

  expect(getByText(defaultContentItem.name)).toBeInTheDocument();
  expect(getByText(defaultContentItem.package_count + '')).toBeInTheDocument();
});
