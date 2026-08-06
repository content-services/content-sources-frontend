import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateTokenModal from './CreateTokenModal';
import { ReactQueryTestWrapper } from 'testingHelpers';
import { useCreateLightwellToken } from 'services/LightwellTokens/LightwellTokensQueries';

jest.mock('services/LightwellTokens/LightwellTokensQueries', () => ({
  useCreateLightwellToken: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => () => ({
  auth: {
    getUser: () =>
      Promise.resolve({
        identity: { user: { user_id: 'current-user-id', is_org_admin: true } },
      }),
  },
}));

jest.mock('Hooks/useNotification', () => () => ({ notify: () => null }));
jest.mock('Hooks/useErrorNotification', () => () => jest.fn());

const mockMutateAsync = jest.fn();
const mockOnClose = jest.fn();

beforeEach(() => {
  mockMutateAsync.mockReset();
  mockOnClose.mockReset();
  (useCreateLightwellToken as jest.Mock).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  });
});

const renderModal = () =>
  render(
    <ReactQueryTestWrapper>
      <CreateTokenModal onClose={mockOnClose} />
    </ReactQueryTestWrapper>,
  );

it('creates a token and shows plaintext once', async () => {
  const user = userEvent.setup();
  mockMutateAsync.mockResolvedValue({
    name: 'ci-token',
    token: 'lw_abcdefgh_secret',
    token_prefix: 'lw_abcdefg',
    uuid: 'token-uuid',
  });

  renderModal();

  expect(await screen.findByText('Create access token')).toBeInTheDocument();
  expect(await screen.findByDisplayValue('current-user-id')).toBeInTheDocument();

  await user.type(screen.getByLabelText(/Name/), 'ci-token');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() =>
    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'ci-token',
      user_id: 'current-user-id',
    }),
  );

  expect(await screen.findByText('Access token created')).toBeInTheDocument();
  expect(screen.getByText('Copy this token now. It will not be shown again.')).toBeInTheDocument();
  expect(screen.getByDisplayValue('lw_abcdefgh_secret')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(mockOnClose).toHaveBeenCalled();
});

it('allows overriding the default user id', async () => {
  const user = userEvent.setup();
  mockMutateAsync.mockResolvedValue({
    name: 'ci-token',
    token: 'lw_abcdefgh_secret',
    token_prefix: 'lw_abcdefg',
    uuid: 'token-uuid',
  });

  renderModal();

  const userIdInput = await screen.findByLabelText(/User ID/);
  await waitFor(() => expect(userIdInput).toHaveValue('current-user-id'));
  await user.clear(userIdInput);
  await user.type(userIdInput, 'other-user-id');
  await user.type(screen.getByLabelText(/^Name/), 'ci-token');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() =>
    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'ci-token',
      user_id: 'other-user-id',
    }),
  );
});

it('does not submit without a name', async () => {
  renderModal();

  expect(await screen.findByDisplayValue('current-user-id')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  expect(mockMutateAsync).not.toHaveBeenCalled();
});
