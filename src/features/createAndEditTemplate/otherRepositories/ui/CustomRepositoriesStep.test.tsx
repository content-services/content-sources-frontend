import { render } from '@testing-library/react';
import {
  useCustomRepositoriesApi,
  useCustomRepositoriesState,
  useDerivedState,
  usePagination,
  useSort,
} from '../store/CustomRepositoriesStore';
import { defaultContentItem } from 'testingHelpers';
import CustomRepositoriesStep from './CustomRepositoriesStep';

jest.mock(
  '@src/features/createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore',
  () => ({
    useCustomRepositoriesApi: jest.fn(),
    useCustomRepositoriesState: jest.fn(),
    useDerivedState: jest.fn(),
    usePagination: jest.fn(),
    useSort: jest.fn(),
  }),
);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
  useHref: () => 'insights/content/templates',
}));

it('expect CustomRepositoriesStep to render correctly', () => {
  const mockRedhatRepositoriesApi = {
    toggleSelected: () => {},
    turnPage: () => {},
    setPagination: () => {},
    filterByName: () => {},
    filterSelected: () => {},
    clearFilterByName: () => {},
    refetchOtherRepositories: () => {},
  };

  const mockCustomRepositoriesState = {
    isLoading: false,
    isFetching: false,
    count: 1,
    repositoriesList: [defaultContentItem],
    filterQuery: '',
  };
  const mockDerivedState = {
    isSelectedFiltered: false,
    isInOtherUUIDs: () => {},
    areOtherReposToSelect: true,
    noOtherReposSelected: true,
  };
  const mockPaginationState = { page: 1, perPage: 20 };
  const mockSort = { setSortProps: () => {} };

  (useCustomRepositoriesApi as jest.Mock).mockImplementation(() => mockRedhatRepositoriesApi);
  (useCustomRepositoriesState as jest.Mock).mockImplementation(() => mockCustomRepositoriesState);
  (useDerivedState as jest.Mock).mockImplementation(() => mockDerivedState);
  (usePagination as jest.Mock).mockImplementation(() => mockPaginationState);
  (useSort as jest.Mock).mockImplementation(() => mockSort);

  const { getByRole, getByText } = render(<CustomRepositoriesStep />);

  const firstCheckboxInList = getByRole('checkbox', { name: 'Select row 0' });

  expect(firstCheckboxInList).toBeInTheDocument();
  expect(firstCheckboxInList).toBeDisabled();

  expect(getByText(defaultContentItem.name)).toBeInTheDocument();
  expect(getByText(defaultContentItem.package_count + '')).toBeInTheDocument();
});
