import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BeaconSubmissionDetail from './BeaconSubmissionDetail';
import { useBeaconSubmissionDetail } from '../hooks/useBeaconSubmissionDetail';

jest.mock('../hooks/useBeaconSubmissionDetail');
const mockedHook = useBeaconSubmissionDetail as jest.Mock;

const buildHook = (overrides = {}) => ({
  submission: {
    uuid: 'sub-1',
    status: 'uploading',
    created_at: '2026-10-20T10:00:00Z',
    username: 'author@example.com',
    filename: 'RHOSE-4.9.json',
    files: [
      { uuid: 'f-0', filename: 'RHOSE-4.9.json' },
      { uuid: 'f-1', filename: 'repro.jpg' },
    ],
  },
  isLoading: false,
  isError: false,
  canEdit: true,
  canProcess: false,
  mainFile: { uuid: 'f-0', filename: 'RHOSE-4.9.json' },
  reproducerFiles: [{ uuid: 'f-1', filename: 'repro.jpg' }],
  addFiles: jest.fn(),
  deleteFile: jest.fn(),
  deleteWholeSubmission: jest.fn(),
  submit: jest.fn(),
  process: jest.fn(),
  download: jest.fn(),
  isMutating: false,
  ...overrides,
});

const confirmInDialog = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name }));
};

beforeEach(() => {
  mockedHook.mockReturnValue(buildHook());
});

describe('BeaconSubmissionDetail', () => {
  it('renders the main report and reproducer filenames', () => {
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    expect(screen.getByText('RHOSE-4.9.json')).toBeInTheDocument();
    expect(screen.getByText('repro.jpg')).toBeInTheDocument();
    expect(screen.getByText(/Reproducers \(1\)/)).toBeInTheDocument();
  });

  it('shows edit controls when canEdit', () => {
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    expect(screen.getByRole('button', { name: /Delete submission/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload reproducer file/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit for structural validation by your STAM' }),
    ).toBeInTheDocument();
  });

  it('hides edit controls when not editable, keeping downloads', () => {
    mockedHook.mockReturnValue(buildHook({ canEdit: false }));
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    expect(screen.queryByRole('button', { name: /Delete submission/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Upload reproducer file/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit for structural validation by your STAM' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download RHOSE-4.9.json/i })).toBeInTheDocument();
  });

  it('deletes the whole submission only after confirming', async () => {
    const deleteWholeSubmission = jest.fn();
    mockedHook.mockReturnValue(buildHook({ deleteWholeSubmission }));
    const user = userEvent.setup();
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    await user.click(screen.getByRole('button', { name: /Delete submission/i }));
    expect(deleteWholeSubmission).not.toHaveBeenCalled();

    await confirmInDialog(user, 'Delete');
    expect(deleteWholeSubmission).toHaveBeenCalledTimes(1);
  });

  it('submits only after confirming', async () => {
    const submit = jest.fn();
    mockedHook.mockReturnValue(buildHook({ submit }));
    const user = userEvent.setup();
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    await user.click(
      screen.getByRole('button', { name: 'Submit for structural validation by your STAM' }),
    );
    expect(submit).not.toHaveBeenCalled();

    await confirmInDialog(user, 'Submit');
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('shows "Mark as processed" when canProcess and processes after confirming', async () => {
    const process = jest.fn();
    mockedHook.mockReturnValue(buildHook({ canEdit: false, canProcess: true, process }));
    const user = userEvent.setup();
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    await user.click(screen.getByRole('button', { name: 'Mark as processed' }));
    expect(process).not.toHaveBeenCalled();

    await confirmInDialog(user, 'Mark as processed');
    expect(process).toHaveBeenCalledTimes(1);
  });

  it('hides "Mark as processed" when cannot process', () => {
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    expect(screen.queryByRole('button', { name: 'Mark as processed' })).not.toBeInTheDocument();
  });

  it('downloads a reproducer when its download button is clicked', async () => {
    const download = jest.fn();
    mockedHook.mockReturnValue(buildHook({ download }));
    const user = userEvent.setup();
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    await user.click(screen.getByRole('button', { name: /Download repro.jpg/i }));

    expect(download).toHaveBeenCalledWith('repro.jpg');
  });

  it('adds selected files through the hidden upload input', async () => {
    const addFiles = jest.fn();
    mockedHook.mockReturnValue(buildHook({ addFiles }));
    const user = userEvent.setup();
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    const file = new File(['a'], 'extra.png', { type: 'image/png' });
    await user.upload(screen.getByTestId('reproducer-file-input'), file);

    expect(addFiles).toHaveBeenCalledWith([file]);
  });

  it('renders "Save for later" only when onClose is provided and calls it', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    const { rerender } = render(<BeaconSubmissionDetail uuid='sub-1' />);
    expect(screen.queryByRole('button', { name: 'Save for later' })).not.toBeInTheDocument();

    rerender(<BeaconSubmissionDetail uuid='sub-1' onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Save for later' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a loading indicator while loading', () => {
    mockedHook.mockReturnValue(buildHook({ isLoading: true, submission: undefined }));
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error alert on error', () => {
    mockedHook.mockReturnValue(
      buildHook({ isError: true, submission: undefined, mainFile: undefined }),
    );
    render(<BeaconSubmissionDetail uuid='sub-1' />);

    expect(screen.getByText(/Could not load the submission/i)).toBeInTheDocument();
  });
});
