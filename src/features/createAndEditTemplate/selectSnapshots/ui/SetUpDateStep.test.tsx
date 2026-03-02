import { render } from '@testing-library/react';
import { useSetUpDateApi } from '../store/SetUpDateStore';
import SetUpDateStep from './SetUpDateStep';
import { defaultContentItem } from 'testingHelpers';

jest.mock('@src/features/createAndEditTemplate/selectSnapshots/store/SetUpDateStore', () => ({
  useSetUpDateApi: jest.fn(),
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
    snapshotDate: '2024-01-22',
    isLatestSnapshot: false,
    isLoading: false,
    contentData: {
      data: [defaultContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
    hasIsAfter: false,
    dateIsValid: false,
    toggleLatestSnapshot: () => {},
    chooseSnapshotDate: () => {},
  };

  (useSetUpDateApi as jest.Mock).mockImplementation(() => mockSetUpDateApi);

  const { queryByText, getByRole } = render(<SetUpDateStep />);
  expect(queryByText('Select date for snapshotted repositories')).toBeInTheDocument();

  const dateInput = getByRole('textbox', { name: 'Date picker' });
  expect(dateInput).toBeInTheDocument();
  expect(dateInput).toHaveAttribute('value', '2024-01-22');
});

it('expect Set snapshot date step to render use latest', () => {
  const mockSetUpDateApi = {
    snapshotDate: '',
    isLatestSnapshot: true,
    isLoading: false,
    contentData: {
      data: [defaultContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
    hasIsAfter: false,
    dateIsValid: false,
    toggleLatestSnapshot: () => {},
    chooseSnapshotDate: () => {},
  };

  (useSetUpDateApi as jest.Mock).mockImplementation(() => mockSetUpDateApi);

  const { queryByText } = render(<SetUpDateStep />);

  expect(queryByText('Select date for snapshotted repositories')).toBeInTheDocument();
});
