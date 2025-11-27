import { render } from '@testing-library/react';
import { defaultContentItem } from 'testingHelpers';
import AdditionalRepositories from './AdditionalRepositories';
import {
  useAdditionalRepositoriesApi,
  useAdditionalRepositoriesState,
  useDerivedState,
  usePaginationState,
  useSort,
} from '../store/AdditionalRepositoriesStore';

jest.mock(
  '@src/Pages/Templates/TemplatesTable/components/CreateTemplate/steps/AdditionalRepositories/store/AdditionalRepositoriesStore',
  () => ({
    useAdditionalRepositoriesState: jest.fn(),
    useDerivedState: jest.fn(),
    useAdditionalRepositoriesApi: jest.fn(),
    usePaginationState: jest.fn(),
    useSort: jest.fn(),
  }),
);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
  useHref: () => 'insights/content/templates',
}));

it('expect Additional Repositories to render correctly', () => {
  const mockAdditionalState = {
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

  const mockAdditionalApi = {
    filterByName: () => {},
    filterSelected: () => {},
    turnPage: () => {},
    setPagination: () => {},
    toggleChecked: () => {},
  };
  const mockPaginationState = { page: 1, perPage: 20 };
  const mockSort = { setSortProps: () => {} };

  (useAdditionalRepositoriesState as jest.Mock).mockImplementation(() => mockAdditionalState);
  (useDerivedState as jest.Mock).mockImplementation(() => mockDerivedState);
  (useAdditionalRepositoriesApi as jest.Mock).mockImplementation(() => mockAdditionalApi);
  (usePaginationState as jest.Mock).mockImplementation(() => mockPaginationState);
  (useSort as jest.Mock).mockImplementation(() => mockSort);

  const { getByRole, getByText } = render(<AdditionalRepositories />);

  const firstCheckboxInList = getByRole('checkbox', { name: 'Select row 0' });

  expect(firstCheckboxInList).toBeInTheDocument();

  expect(getByText(defaultContentItem.name)).toBeInTheDocument();
  expect(getByText(defaultContentItem.package_count + '')).toBeInTheDocument();
});
