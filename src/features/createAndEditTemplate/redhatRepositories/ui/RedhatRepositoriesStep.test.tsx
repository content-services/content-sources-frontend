import { render } from '@testing-library/react';
import {
  useDerivedState,
  usePagination,
  useRedhatRepositoriesApi,
  useRedhatRepositoriesState,
  useSort,
} from '../store/RedhatRepositoriesStore';
import { defaultContentItem } from 'testingHelpers';
import RedhatRepositoriesStep from './RedhatRepositoriesStep';

jest.mock(
  '@src/features/createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore',
  () => ({
    useRedhatRepositoriesApi: jest.fn(),
    useRedhatRepositoriesState: jest.fn(),
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

it('expect RedhatRepositoriesStep to render correctly', () => {
  const mockRedhatRepositoriesApi = {
    filterByName: () => {},
    filterSelected: () => {},
    turnPage: () => {},
    setPagination: () => {},
    toggleChecked: () => {},
    clearFilterByName: () => {},
  };
  const RedhatRepositoriesState = {
    isLoading: false,
    count: 1,
    filterQuery: '',
    isSelectedFiltered: false,
    repositoriesList: [defaultContentItem],
  };

  const hardcodedUUIDs = [defaultContentItem.uuid];
  const redHatRepos = [defaultContentItem.uuid];
  const mockDerivedState = {
    areAdditionalReposToSelect: true,
    noAdditionalReposSelected: true,
    isInHardcodedUUIDs: (uuid) => hardcodedUUIDs.includes(uuid),
    isInRedhatUUIDs: (uuid) => redHatRepos.includes(uuid),
  };
  const mockPaginationState = { page: 1, perPage: 20 };
  const mockSort = { setSortProps: () => {} };

  (useRedhatRepositoriesApi as jest.Mock).mockImplementation(() => mockRedhatRepositoriesApi);
  (useRedhatRepositoriesState as jest.Mock).mockImplementation(() => RedhatRepositoriesState);
  (useDerivedState as jest.Mock).mockImplementation(() => mockDerivedState);
  (usePagination as jest.Mock).mockImplementation(() => mockPaginationState);
  (useSort as jest.Mock).mockImplementation(() => mockSort);

  const { getByRole, getByText } = render(<RedhatRepositoriesStep />);

  const firstCheckboxInList = getByRole('checkbox', { name: 'Select row 0' });

  expect(firstCheckboxInList).toBeInTheDocument();

  expect(getByText(defaultContentItem.name)).toBeInTheDocument();
  expect(getByText(defaultContentItem.package_count + '')).toBeInTheDocument();
});
