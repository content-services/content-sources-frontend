import { fireEvent, render } from '@testing-library/react';
import { testRepositoryParamsResponse } from '../../../testingHelpers';
import AddContent from './AddContent/AddContent';
import ContentListFilters from './ContentListFilters';
import { useQueryClient } from 'react-query';
import { ContentOrigin } from '../../../services/Content/ContentApi';

jest.mock('./AddContent/AddContent');

(AddContent as jest.Mock).mockImplementation(() => 'Add Content');

jest.mock('../../../middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../Hooks/useDebounce', () => (value) => value);
jest.mock('react-query');

beforeAll(() => {
  (useQueryClient as jest.Mock).mockImplementation(() => ({
    getQueryData: () => testRepositoryParamsResponse,
  }));
});

it('Render loading state (disabled)', () => {
  const { getByRole } = render(
    <ContentListFilters
      contentOrigin={ContentOrigin.EXTERNAL}
      setContentOrigin={() => null}
      isLoading={true}
      setFilterData={() => null}
      filterData={{
        searchQuery: '',
        versions: [],
        arches: [],
        statuses: [],
      }}
      atLeastOneRepoChecked={false}
      numberOfReposChecked={0}
      deleteCheckedRepos={() => null}
    />,
  );

  const filterInput = getByRole('textbox');
  expect(filterInput).toHaveAttribute('disabled');
});

it('Select a filter of each type and ensure chips are present', () => {
  const { queryByText, getByRole, getByLabelText } = render(
    <ContentListFilters
      contentOrigin={ContentOrigin.EXTERNAL}
      setContentOrigin={() => null}
      setFilterData={() => null}
      filterData={{
        searchQuery: '',
        versions: [],
        arches: [],
        statuses: [],
      }}
      atLeastOneRepoChecked={false}
      numberOfReposChecked={0}
      deleteCheckedRepos={() => null}
    />,
  );

  const filterInput = getByRole('textbox');
  expect(filterInput).not.toHaveAttribute('disabled');
  fireEvent.change(filterInput, { target: { value: 'EPEL' } });

  const optionMenu = getByLabelText('Options menu');
  fireEvent.click(optionMenu);

  // Select a Version item
  const versionOption = queryByText('Version') as Element;
  expect(versionOption).toBeInTheDocument();
  fireEvent.click(versionOption);

  const versionSelector = getByLabelText('filter version') as Element;
  expect(versionSelector).toBeInTheDocument();
  fireEvent.click(versionSelector);
  const versionItem = queryByText('el7') as Element;
  expect(versionItem).toBeInTheDocument();
  fireEvent.click(versionItem);

  fireEvent.click(optionMenu);

  // Select an architecture item
  const archOption = queryByText('Architecture') as Element;
  expect(archOption).toBeInTheDocument();
  fireEvent.click(archOption);

  const archSelector = getByLabelText('filter architecture') as Element;
  expect(archSelector).toBeInTheDocument();
  fireEvent.click(archSelector);

  const archItem = queryByText('aarch64') as Element;
  expect(archItem).toBeInTheDocument();
  fireEvent.click(archItem);

  fireEvent.click(optionMenu);

  // Select a Status item
  const statusOption = queryByText('Status') as Element;
  expect(statusOption).toBeInTheDocument();
  fireEvent.click(statusOption);

  const statusSelector = getByLabelText('filter status') as Element;
  expect(statusSelector).toBeInTheDocument();
  fireEvent.click(statusSelector);

  const statusItem = queryByText('Invalid') as Element;
  expect(statusItem).toBeInTheDocument();
  fireEvent.click(statusItem);

  // Click the optionsButton to make the statusMenu disappear
  fireEvent.click(optionMenu);

  // Check all the chips are there
  expect(queryByText('el7')).toBeInTheDocument();
  expect(queryByText('aarch64')).toBeInTheDocument();
  expect(queryByText('Invalid')).toBeInTheDocument();
  expect(queryByText('EPEL')).toBeInTheDocument();
});
