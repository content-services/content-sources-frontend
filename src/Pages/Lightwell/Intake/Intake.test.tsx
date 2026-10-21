import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import Intake from './Intake';
import { useIntake } from './hooks/useIntake';
import { CLEARINGHOUSE_SUBMISSIONS_KEY } from 'services/Lightwell/ClearinghouseQueries';

jest.mock('@scalprum/react-core', () => ({
  useRemoteHook: jest.fn(),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: jest.fn(() => true),
}));

jest.mock('Hooks/Lightwell/navigation/useLightwellRootPath', () => ({
  useLightwellRootPath: jest.fn(() => '/lightwell'),
}));

jest.mock('./hooks/useIntake');
const mockedIntake = useIntake as jest.Mock;

jest.mock('./components/UploadSuccessStep', () => ({
  __esModule: true,
  default: ({
    uuid,
    onSubmitted,
    onReproducersUploaded,
  }: {
    uuid: string;
    onSubmitted?: () => void;
    onReproducersUploaded?: () => void;
  }) => (
    <div>
      Detail for {uuid}
      <button type='button' onClick={onSubmitted}>
        submit done
      </button>
      <button type='button' onClick={onReproducersUploaded}>
        reproducers done
      </button>
    </div>
  ),
}));

jest.mock('./components/SubmissionsTable', () => ({
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
  return { ...render(<Intake />, { wrapper }), invalidate };
};

beforeEach(() => {
  mockedIntake.mockReturnValue(buildState());
  mockFeatures = { lightwellclearinghouse: ON };
});

describe('Intake', () => {
  it('renders the Intake title and the submissions table', () => {
    renderIntake();

    expect(screen.getByRole('heading', { name: 'Intake' })).toBeInTheDocument();
    expect(screen.getByText('Submissions table')).toBeInTheDocument();
  });

  it('does not render a separate "Submit a vulnerability report" card', () => {
    renderIntake();

    expect(screen.queryByText('Submit a vulnerability report')).not.toBeInTheDocument();
  });

  it('always shows the upload form with no Submit toggle or close button', () => {
    renderIntake();

    expect(screen.getByText('Select vulnerability report to upload')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close upload form/i })).not.toBeInTheDocument();
  });

  it('hides the upload form for users without the write feature, keeping the table', () => {
    mockFeatures = { lightwellclearinghouseread: ON };
    renderIntake();

    expect(screen.queryByText('Select vulnerability report to upload')).not.toBeInTheDocument();
    // Read-only users still see the submissions table.
    expect(screen.getByText('Submissions table')).toBeInTheDocument();
  });

  it('shows the submit-oriented hero description for writers', () => {
    renderIntake();

    expect(screen.getByText(/Submit vulnerability findings/i)).toBeInTheDocument();
  });

  it('shows a review-oriented hero description for read-only (TAM) users', () => {
    mockFeatures = { lightwellclearinghouseread: ON };
    renderIntake();

    expect(
      screen.getByText(/Review vulnerability findings submitted by customers/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Submit vulnerability findings/i)).not.toBeInTheDocument();
  });

  it('shows the submission detail and hides the form in the detail step', () => {
    mockedIntake.mockReturnValue(buildState({ step: 'detail', createdUuid: 'sub-1' }));
    renderIntake();

    expect(screen.getByText('Detail for sub-1')).toBeInTheDocument();
    expect(screen.queryByText('Select vulnerability report to upload')).not.toBeInTheDocument();
  });

  it('does not refetch the submissions list just because the success step is shown', () => {
    mockedIntake.mockReturnValue(buildState({ step: 'detail', createdUuid: 'sub-1' }));
    const { invalidate } = renderIntake();

    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: [CLEARINGHOUSE_SUBMISSIONS_KEY] });
  });

  it('refetches the submissions list and resets when the submission is submitted', async () => {
    const reset = jest.fn();
    mockedIntake.mockReturnValue(buildState({ step: 'detail', createdUuid: 'sub-1', reset }));
    const user = userEvent.setup();
    const { invalidate } = renderIntake();

    await user.click(screen.getByRole('button', { name: 'submit done' }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: [CLEARINGHOUSE_SUBMISSIONS_KEY] });
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('refetches the submissions list and resets after reproducers are uploaded', async () => {
    const reset = jest.fn();
    mockedIntake.mockReturnValue(buildState({ step: 'detail', createdUuid: 'sub-1', reset }));
    const user = userEvent.setup();
    const { invalidate } = renderIntake();

    await user.click(screen.getByRole('button', { name: 'reproducers done' }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: [CLEARINGHOUSE_SUBMISSIONS_KEY] });
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
