import { render } from '@testing-library/react';
import { useRedhatRepositoriesApi } from '../store/RedhatRepositoriesStore';
import { defaultContentItem, defaultTemplateItem } from 'testingHelpers';
import RedhatRepositoriesStep from './RedhatRepositoriesStep';

jest.mock(
  '@src/features/createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore',
  () => ({
    useRedhatRepositoriesApi: jest.fn(),
  }),
);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
  useHref: () => 'insights/content/templates',
}));

it('expect RedhatRepositoriesStep to render correctly', () => {
  const mockRedhatRepositoriesApi = {
    hardcodedUUIDs: [defaultTemplateItem.uuid],
    additionalUUIDs: [],
    contentList: [defaultContentItem],
    columnHeaders: ['Name', 'Advisories', 'Packages'],
    page: 1,
    perPage: 20,
    count: 1,
    isLoading: false,
    additionalReposAvailableToSelect: false,
    noAdditionalRepos: true,
    searchQuery: '',
    toggled: false,
    showLoader: false,
    onSetPage: () => {},
    onPerPageSelect: () => {},
    sortParams: () => undefined,
    setSearchQuery: () => {},
    setToggled: () => {},
    toggleSelected: () => {},
    isInHardcodedUUIDs: () => true,
    isInRedhatUUIDs: () => true,
  };
  (useRedhatRepositoriesApi as jest.Mock).mockImplementation(() => mockRedhatRepositoriesApi);

  const { getByRole, getByText } = render(<RedhatRepositoriesStep />);

  const firstCheckboxInList = getByRole('checkbox', { name: 'Select row 0' });

  expect(firstCheckboxInList).toBeInTheDocument();

  expect(getByText(defaultContentItem.name)).toBeInTheDocument();
  expect(getByText(defaultContentItem.package_count + '')).toBeInTheDocument();
});
