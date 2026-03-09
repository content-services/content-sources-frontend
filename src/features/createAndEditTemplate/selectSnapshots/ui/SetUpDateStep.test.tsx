import { render } from '@testing-library/react';
import {
  useSetUpDateApi,
  useSetUpDateState,
  useDependencyNotificationState,
} from '../store/SetUpDateStore';
import SetUpDateStep from './SetUpDateStep';

jest.mock('@src/features/createAndEditTemplate/selectSnapshots/store/SetUpDateStore', () => ({
  useSetUpDateApi: jest.fn(),
  useSetUpDateState: jest.fn(),
  useDependencyNotificationState: jest.fn(),
}));

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

it('expect Set snapshot date step to render dates', () => {
  const mockSetUpDateApi = {
    toggleLatestSnapshot: () => {},
    chooseSnapshotDate: () => {},
  };

  const mockSetUpDateState = {
    snapshotDate: '2024-01-22',
    isLatestSnapshot: false,
  };
  const mockDependencyNotificationState = {
    repositoryNames: [],
    isNoIssues: true,
    isHidden: false,
    isFetching: false,
    isAlert: false,
  };

  (useSetUpDateApi as jest.Mock).mockImplementation(() => mockSetUpDateApi);
  (useSetUpDateState as jest.Mock).mockImplementation(() => mockSetUpDateState);
  (useDependencyNotificationState as jest.Mock).mockImplementation(
    () => mockDependencyNotificationState,
  );

  const { queryByText, getByRole } = render(<SetUpDateStep />);
  expect(queryByText('Select date for snapshotted repositories')).toBeInTheDocument();

  const dateInput = getByRole('textbox', { name: 'Date picker' });
  expect(dateInput).toBeInTheDocument();
  expect(dateInput).toHaveAttribute('value', '2024-01-22');
});

it('expect Set snapshot date step to render use latest', () => {
  const mockSetUpDateApi = {
    toggleLatestSnapshot: () => {},
    chooseSnapshotDate: () => {},
  };

  const mockSetUpDateState = {
    snapshotDate: '',
    isLatestSnapshot: true,
  };
  const mockDependencyNotificationState = {
    repositoryNames: [],
    isNoIssues: false,
    isHidden: true,
    isFetching: false,
    isAlert: false,
  };

  (useSetUpDateApi as jest.Mock).mockImplementation(() => mockSetUpDateApi);
  (useSetUpDateState as jest.Mock).mockImplementation(() => mockSetUpDateState);
  (useDependencyNotificationState as jest.Mock).mockImplementation(
    () => mockDependencyNotificationState,
  );

  const { queryByText } = render(<SetUpDateStep />);

  expect(queryByText('Select date for snapshotted repositories')).toBeInTheDocument();
});
