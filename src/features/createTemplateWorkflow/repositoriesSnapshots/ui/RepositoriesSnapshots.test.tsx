import { render } from '@testing-library/react';
import RepositoriesSnapshots from './RepositoriesSnapshots';

import {
  useDependencyNotificationState,
  useSnapshotApi,
  useSnapshotState,
} from '../store/SnapshotsStore';

jest.mock(
  '@src/features/createTemplateWorkflow/repositoriesSnapshots/store/SnapshotsStore',
  () => ({
    useDependencyNotificationState: jest.fn(),
    useSnapshotState: jest.fn(),
    useSnapshotApi: jest.fn(),
  }),
);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
  useHref: () => 'insights/content/templates',
}));

// dayJs is an absolute pain, just mock it.
jest.mock('dayjs', () => () => ({
  fromNow: () => '2024-01-22',
  format: () => '2024-01-22',
  endOf: () => '2024-01-22',
  isBefore: () => true,
}));

it('expect Repositories Snapshots with Date to render dates', () => {
  const mockSnapshotsApi = {
    toggleLatestSnapshot: () => {},
    chooseSnapshotDate: () => {},
  };
  const mockNotificationState = {
    repositoryNames: [],
    noIssues: true,
    isFetching: false,
    isHidden: false,
    isAlert: false,
  };
  const mockSnapshotState = { snapshotDate: '2024-01-22', isLatestSnapshot: false };

  (useSnapshotApi as jest.Mock).mockImplementation(() => mockSnapshotsApi);
  (useDependencyNotificationState as jest.Mock).mockImplementation(() => mockNotificationState);
  (useSnapshotState as jest.Mock).mockImplementation(() => mockSnapshotState);

  const { queryByText, getByRole } = render(<RepositoriesSnapshots />);
  expect(queryByText('Select date for snapshotted repositories')).toBeInTheDocument();

  const dateInput = getByRole('textbox', { name: 'Date picker' });
  expect(dateInput).toBeInTheDocument();
  expect(dateInput).toHaveAttribute('value', '2024-01-22');
});

it('expect Repositories Snapshots with Latest Snapshots to render use latest snapshot', () => {
  const mockSnapshotsApi = {
    toggleLatestSnapshot: () => {},
    chooseSnapshotDate: () => {},
  };
  const mockNotificationState = {
    repositoryNames: [],
    noIssues: false,
    isFetching: false,
    isHidden: true,
    isAlert: false,
  };
  const mockSnapshotState = { snapshotDate: '', isLatestSnapshot: true };

  (useSnapshotApi as jest.Mock).mockImplementation(() => mockSnapshotsApi);
  (useDependencyNotificationState as jest.Mock).mockImplementation(() => mockNotificationState);
  (useSnapshotState as jest.Mock).mockImplementation(() => mockSnapshotState);

  const { queryByText, queryByRole } = render(<RepositoriesSnapshots />);

  expect(queryByText('Select date for snapshotted repositories')).toBeInTheDocument();

  const dateInput = queryByRole('textbox', { name: 'Date picker' });
  expect(dateInput).not.toBeInTheDocument();
});
