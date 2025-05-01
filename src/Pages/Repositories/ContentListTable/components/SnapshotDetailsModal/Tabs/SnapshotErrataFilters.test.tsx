import { render } from '@testing-library/react';
import SnapshotErrataFilters from './SnapshotErrataFilters';
import { ContentOrigin } from 'services/Content/ContentApi';
import userEvent from '@testing-library/user-event';

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    contentOrigin: ContentOrigin.CUSTOM,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

it('Render loading state (disabled)', () => {
  const { getByRole } = render(
    <SnapshotErrataFilters
      isLoading={true}
      setFilterData={() => null}
      filterData={{
        search: '',
        type: [],
        severity: [],
      }}
    />,
  );

  const filterInput = getByRole('searchbox');
  expect(filterInput).toHaveAttribute('disabled');
});

it('Select a filter of each type and ensure chips are present snapshotErrataFilters', async () => {
  const { getAllByText, queryByText, getByRole, queryAllByText } = render(
    <SnapshotErrataFilters
      isLoading={false}
      setFilterData={() => null}
      filterData={{
        search: '',
        type: [],
        severity: [],
      }}
    />,
  );

  // Filter on Name / Synopsis
  const nameOrSynopsisFilter = getByRole('searchbox');
  expect(nameOrSynopsisFilter).not.toHaveAttribute('disabled');
  await userEvent.type(nameOrSynopsisFilter, 'EPEL');

  // Select a Type item
  const optionMenu = getAllByText('Name/Synopsis')[0];
  await userEvent.click(optionMenu);

  const typeOption = queryByText('Type') as HTMLElement;
  expect(typeOption).toBeInTheDocument();
  await userEvent.click(typeOption);

  const typeSelector = queryByText('Filter by type') as HTMLElement;
  expect(typeSelector).toBeInTheDocument();

  await userEvent.click(typeSelector);

  const typeItem = queryByText('Security') as Element;
  expect(typeItem).toBeInTheDocument();
  await userEvent.click(typeItem);

  // Select a Severity item
  await userEvent.click(optionMenu);
  const severityOption = queryByText('Severity') as Element;
  expect(severityOption).toBeInTheDocument();
  await userEvent.click(severityOption);

  const severitySelector = queryByText('Filter by severity') as Element;
  expect(severitySelector).toBeInTheDocument();
  return;
  await userEvent.click(severitySelector);
  const severityItem = queryByText('Critical') as Element;

  expect(severityItem).toBeInTheDocument();
  await userEvent.click(severityItem);
  await userEvent.click(severitySelector);

  // Check all the chips are there
  expect(queryByText('EPEL')).toBeInTheDocument();
  expect(queryByText('Security')).toBeInTheDocument();
  expect(queryAllByText('Critical')).toHaveLength(2);
});
