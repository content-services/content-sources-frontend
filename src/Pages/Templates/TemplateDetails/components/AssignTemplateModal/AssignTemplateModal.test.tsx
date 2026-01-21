import { render, waitFor, screen, within } from '@testing-library/react';
import AssignTemplateModal from './AssignTemplateModal';
import { useQueryClient } from 'react-query';
import { useSystemsListQuery } from 'services/Systems/SystemsQueries';
import {
  defaultSystemsListItem,
  defaultTemplateItem,
  defaultUpdateTemplateTaskCompleted,
  minorReleaseSystemsListItem,
  satelliteManagedSystemsListItem,
} from 'testingHelpers';
import type { SystemItem } from 'services/Systems/SystemsApi';
import useHasRegisteredSystems from 'Hooks/useHasRegisteredSystems';

const bananaUUID = 'banana-uuid';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ templateUUID: bananaUUID }),
  useNavigate: jest.fn(),
  useSearchParams: () => [{ get: () => null }, jest.fn()],
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('Hooks/useHasRegisteredSystems');

jest.mock('react-query');

jest.mock('services/Systems/SystemsQueries', () => ({
  useAddTemplateToSystemsQuery: () => ({ mutate: () => undefined, isLoading: false }),
  useSystemsListQuery: jest.fn(),
}));

jest.mock('Hooks/useNotification', () => () => ({ notify: () => null }));

jest.mock('services/Templates/TemplateQueries', () => ({
  useFetchTemplate: () => ({ data: defaultTemplateItem }),
}));

beforeAll(() => {
  (useQueryClient as jest.Mock).mockImplementation(() => ({
    getQueryData: () => ({
      version: 1,
      name: 'Steve the template',
      arch: 'x86_64',
      last_update_task: defaultUpdateTemplateTaskCompleted,
    }),
  }));
});

(useHasRegisteredSystems as jest.Mock).mockReturnValue({
  hasRegisteredSystems: true,
  isFetchingRegSystems: false,
  isErrorFetchingRegSystems: false,
});

(useSystemsListQuery as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  isFetching: false,
  isError: false,
  data: undefined,
}));

it('shows registration view if no systems are present', async () => {
  (useHasRegisteredSystems as jest.Mock).mockImplementation(() => ({
    hasRegisteredSystems: false,
    isFetchingRegSystems: false,
    isErrorFetchingRegSystems: false,
  }));
  render(<AssignTemplateModal />);
  expect(screen.getByText('Non-registered systems')).toBeInTheDocument();
});

it('renders systems list and pre-selects systems already assigned to template', async () => {
  (useHasRegisteredSystems as jest.Mock).mockImplementation(() => ({
    hasRegisteredSystems: true,
    isFetchingRegSystems: false,
    isErrorFetchingRegSystems: false,
  }));
  (useSystemsListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    isError: false,
    data: {
      data: new Array(15).fill(defaultSystemsListItem).map((item: SystemItem, index) => ({
        ...item,
        id: item.id + index,
        attributes: {
          ...item.attributes,
          display_name: item.attributes.display_name + index,
          template_uuid: !index ? bananaUUID : item.attributes.template_uuid,
        },
      })),
      meta: { total_items: 15, limit: 20, offset: 0 },
    },
  }));
  render(<AssignTemplateModal />);

  expect(screen.getByText('14867.host.example.com14')).toBeInTheDocument();

  // ensure first item is pre-selected
  expect(screen.getByRole('checkbox', { name: 'Select row 0', checked: true })).toBeInTheDocument();
  expect(
    screen.getByRole('checkbox', { name: 'Select row 1', checked: false }),
  ).toBeInTheDocument();
});

it('prevents selection of systems with minor release versions and shows warning icon', async () => {
  (useHasRegisteredSystems as jest.Mock).mockImplementation(() => ({
    hasRegisteredSystems: true,
    isFetchingRegSystems: false,
    isErrorFetchingRegSystems: false,
  }));
  (useSystemsListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    isError: false,
    data: {
      data: [defaultSystemsListItem, minorReleaseSystemsListItem],
      meta: { total_items: 2, limit: 20, offset: 0 },
    },
  }));
  render(<AssignTemplateModal />);

  await waitFor(() => {
    expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header + 2 data rows
  });

  expect(screen.getByText('14867.host.example.com')).toBeInTheDocument();
  expect(screen.getByText('40098.host.example.com')).toBeInTheDocument();

  expect(screen.getByRole('checkbox', { name: 'Select row 0' })).toBeEnabled();
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeDisabled();

  // Warning icon should be present for minor release system
  const warningIcon = screen.getByTestId('system-list-warning-icon');
  expect(warningIcon).toBeInTheDocument();

  // Verify the warning icon is in the same row as the minor release system
  expect(
    within(warningIcon.closest('tr')!).getByText('40098.host.example.com'),
  ).toBeInTheDocument();
});

it('prevents selection of satellite-managed systems and shows warning icon', async () => {
  (useHasRegisteredSystems as jest.Mock).mockImplementation(() => ({
    hasRegisteredSystems: true,
    isFetchingRegSystems: false,
    isErrorFetchingRegSystems: false,
  }));
  (useSystemsListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    isError: false,
    data: {
      data: [defaultSystemsListItem, satelliteManagedSystemsListItem],
      meta: { total_items: 2, limit: 20, offset: 0 },
    },
  }));
  render(<AssignTemplateModal />);

  await waitFor(() => {
    expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header + 2 data rows
  });

  expect(screen.getByText('14867.host.example.com')).toBeInTheDocument();
  expect(screen.getByText('69204.host.example.com')).toBeInTheDocument();

  expect(screen.getByRole('checkbox', { name: 'Select row 0' })).toBeEnabled();
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeDisabled();

  // Warning icon should be present for satellite-managed system
  const warningIcon = screen.getByTestId('system-list-warning-icon');
  expect(warningIcon).toBeInTheDocument();

  // Verify the warning icon is in the same row as the satellite-managed system
  expect(
    within(warningIcon.closest('tr')!).getByText('69204.host.example.com'),
  ).toBeInTheDocument();
});
