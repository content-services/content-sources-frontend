import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import BeaconIntake from './BeaconIntake';
import { useBeaconIntake } from './hooks/useBeaconIntake';
import { CLEARINGHOUSE_SUBMISSIONS_KEY } from 'services/Lightwell/ClearinghouseQueries';

jest.mock('./hooks/useBeaconIntake');
const mockedIntake = useBeaconIntake as jest.Mock;

jest.mock('./components/BeaconSubmissionDetail', () => ({
  __esModule: true,
  default: ({ uuid, onClose }: { uuid: string; onClose?: () => void }) => (
    <div>
      Detail for {uuid}
      {onClose ? (
        <button type='button' onClick={onClose}>
          Save for later
        </button>
      ) : null}
    </div>
  ),
}));

jest.mock('./components/BeaconSubmissionsTable', () => ({
  __esModule: true,
  default: () => <div>Submissions table</div>,
}));

const ON = { enabled: true, accessible: true };
let mockFeatures: Record<string, { enabled: boolean; accessible: boolean }> = {
  lightwellclearinghouse: ON,
};
jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({ features: mockFeatures }),
}));

const buildState = (overrides = {}) => ({
  step: 'select',
  file: undefined,
  fileError: undefined,
  createdUuid: undefined,
  isUploading: false,
  onDropAccepted: jest.fn(),
  reset: jest.fn(),
  ...overrides,
});

const renderIntake = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...render(<BeaconIntake />, { wrapper }), invalidate };
};

beforeEach(() => {
  mockedIntake.mockReturnValue(buildState());
  mockFeatures = { lightwellclearinghouse: ON };
});

describe('BeaconIntake', () => {
  it('renders the Intake title and the submissions table', () => {
    renderIntake();

    expect(screen.getByRole('heading', { name: 'Intake' })).toBeInTheDocument();
    expect(screen.getByText('Submissions table')).toBeInTheDocument();
  });

  it('does not render a separate "Submit a vulnerability report" card', () => {
    renderIntake();

    expect(screen.queryByText('Submit a vulnerability report')).not.toBeInTheDocument();
  });

  it('shows the Submit button and reveals the form (with no Cancel) on click', async () => {
    const user = userEvent.setup();
    renderIntake();

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText('Select vulnerability report to upload')).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByText('Select vulnerability report to upload')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    // Cancel button removed; a corner close control replaces it.
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close upload form/i })).toBeInTheDocument();
  });

  it('hides the upload button for users without the write feature', () => {
    mockFeatures = { lightwellclearinghouseread: ON };
    renderIntake();

    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    // Read-only users still see the submissions table.
    expect(screen.getByText('Submissions table')).toBeInTheDocument();
  });

  it('shows the submission detail and hides the form in the detail step', () => {
    mockedIntake.mockReturnValue(buildState({ step: 'detail', createdUuid: 'sub-1' }));
    renderIntake();

    expect(screen.getByText('Detail for sub-1')).toBeInTheDocument();
    expect(screen.queryByText('Select vulnerability report to upload')).not.toBeInTheDocument();
  });

  it('refetches the submissions list only when Save for later is clicked', async () => {
    mockedIntake.mockReturnValue(buildState({ step: 'detail', createdUuid: 'sub-1' }));
    const user = userEvent.setup();
    const { invalidate } = renderIntake();

    // Not refetched just because the detail is shown after upload.
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: [CLEARINGHOUSE_SUBMISSIONS_KEY] });

    await user.click(screen.getByRole('button', { name: 'Save for later' }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: [CLEARINGHOUSE_SUBMISSIONS_KEY] });
  });
});
