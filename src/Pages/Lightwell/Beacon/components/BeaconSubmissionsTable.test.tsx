import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BeaconSubmissionsTable from './BeaconSubmissionsTable';
import { useSubmissionsListQuery } from 'services/Lightwell/ClearinghouseQueries';

jest.mock('services/Lightwell/ClearinghouseQueries');
const mockedList = useSubmissionsListQuery as jest.Mock;

jest.mock('./BeaconSubmissionDetail', () => ({
  __esModule: true,
  default: ({ uuid }: { uuid: string }) => <div>Detail for {uuid}</div>,
}));

const submission = {
  uuid: 'sub-1',
  status: 'uploading',
  created_at: '2026-10-20T10:00:00Z',
  username: 'author@example.com',
  filename: 'RHOSE-4.9.json',
  files: [{ uuid: 'f-0', filename: 'submission.json' }],
};

const buildQuery = (overrides = {}) => ({
  data: { data: [submission], meta: { count: 1, limit: 20, offset: 0 } },
  isLoading: false,
  isError: false,
  error: undefined,
  ...overrides,
});

beforeEach(() => {
  mockedList.mockReturnValue(buildQuery());
});

describe('BeaconSubmissionsTable', () => {
  it('renders the section title and description', () => {
    render(<BeaconSubmissionsTable />);

    expect(screen.getByText('Submissions')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Original JSON and reproducer archives are not available for download here.',
      ),
    ).toBeInTheDocument();
  });

  it('renders a row per submission with filename, status, date and author', () => {
    render(<BeaconSubmissionsTable />);

    expect(screen.getByText('RHOSE-4.9.json')).toBeInTheDocument();
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    expect(screen.getByText('20 Oct 2026')).toBeInTheDocument();
    expect(screen.getByText('author@example.com')).toBeInTheDocument();
  });

  it('shows the processed date for a processed submission', () => {
    mockedList.mockReturnValue(
      buildQuery({
        data: {
          data: [
            {
              ...submission,
              status: 'processed',
              processed_at: '2026-10-22T09:30:00Z',
              processed_by: 'tam@example.com',
            },
          ],
          meta: { count: 1 },
        },
      }),
    );
    render(<BeaconSubmissionsTable />);

    expect(screen.getByRole('columnheader', { name: 'Processed at' })).toBeInTheDocument();
    expect(screen.getByText('22 Oct 2026')).toBeInTheDocument();
  });

  it('shows a dash in the processed column when not yet processed', () => {
    render(<BeaconSubmissionsTable />);

    // The single (uploading) submission has no processed date, so its Processed cell is a dash.
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders a short one-sentence empty state when there are no submissions', () => {
    mockedList.mockReturnValue(buildQuery({ data: { data: [], meta: { count: 0 } } }));
    render(<BeaconSubmissionsTable />);

    expect(
      screen.getByText(
        'No submissions yet. Submit a vulnerability findings JSON payload to see it listed here.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('RHOSE-4.9.json')).not.toBeInTheDocument();
  });

  it('reveals BeaconSubmissionDetail when a row is expanded', async () => {
    const user = userEvent.setup();
    render(<BeaconSubmissionsTable />);

    expect(screen.queryByText('Detail for sub-1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /details/i }));

    expect(screen.getByText('Detail for sub-1')).toBeInTheDocument();
  });

  it('renders a skeleton while loading', () => {
    mockedList.mockReturnValue(buildQuery({ isLoading: true, data: undefined }));
    render(<BeaconSubmissionsTable />);

    expect(screen.getByTestId('beacon-submissions-skeleton')).toBeInTheDocument();
  });

  it('renders an inline error alert on fetch failure without throwing', () => {
    mockedList.mockReturnValue(
      buildQuery({ isError: true, error: new Error('boom'), data: undefined }),
    );

    expect(() => render(<BeaconSubmissionsTable />)).not.toThrow();
    expect(screen.getByText(/Could not load submissions/i)).toBeInTheDocument();
  });
});
