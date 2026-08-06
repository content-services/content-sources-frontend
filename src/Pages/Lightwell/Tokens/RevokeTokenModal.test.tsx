import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RevokeTokenModal from './RevokeTokenModal';
import { ReactQueryTestWrapper } from 'testingHelpers';
import { useRevokeLightwellToken } from 'services/LightwellTokens/LightwellTokensQueries';

jest.mock('services/LightwellTokens/LightwellTokensQueries', () => ({
  useRevokeLightwellToken: jest.fn(),
}));

jest.mock('Hooks/useNotification', () => () => ({ notify: () => null }));
jest.mock('Hooks/useErrorNotification', () => () => jest.fn());

const mockMutateAsync = jest.fn();
const mockOnClose = jest.fn();

beforeEach(() => {
  mockMutateAsync.mockReset();
  mockOnClose.mockReset();
  (useRevokeLightwellToken as jest.Mock).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  });
});

it('revokes the token and closes on confirm', async () => {
  const user = userEvent.setup();
  mockMutateAsync.mockResolvedValue(undefined);

  render(
    <ReactQueryTestWrapper>
      <RevokeTokenModal token={{ uuid: 'token-uuid', name: 'ci-token' }} onClose={mockOnClose} />
    </ReactQueryTestWrapper>,
  );

  expect(screen.getByText('Revoke access token?')).toBeInTheDocument();
  expect(screen.getByText('ci-token')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Revoke' }));

  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith('token-uuid'));
  expect(mockOnClose).toHaveBeenCalled();
});

it('closes without revoking on cancel', async () => {
  const user = userEvent.setup();

  render(
    <ReactQueryTestWrapper>
      <RevokeTokenModal token={{ uuid: 'token-uuid', name: 'ci-token' }} onClose={mockOnClose} />
    </ReactQueryTestWrapper>,
  );

  await user.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(mockMutateAsync).not.toHaveBeenCalled();
  expect(mockOnClose).toHaveBeenCalled();
});
