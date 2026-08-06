import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TokensTable from './TokensTable';
import { ReactQueryTestWrapper } from 'testingHelpers';
import {
  useCreateLightwellToken,
  useLightwellTokensQuery,
} from 'services/LightwellTokens/LightwellTokensQueries';
import { useAppContext } from 'middleware/AppContext';
import { useIsOrgAdmin } from 'Hooks/Lightwell/useIsOrgAdmin';
import { useLightwellNavigateTo } from 'Hooks/Lightwell/navigation/useLightwellNavigateTo';
import type { LightwellTokenResponse } from 'services/LightwellTokens/LightwellTokensApi';

jest.mock('services/LightwellTokens/LightwellTokensQueries', () => ({
  useLightwellTokensQuery: jest.fn(),
  useCreateLightwellToken: jest.fn(),
  useRevokeLightwellToken: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('Hooks/Lightwell/useIsOrgAdmin', () => ({
  useIsOrgAdmin: jest.fn(),
  canManageLightwellTokens: jest.requireActual('Hooks/Lightwell/useIsOrgAdmin')
    .canManageLightwellTokens,
}));

jest.mock('Hooks/Lightwell/navigation/useLightwellNavigateTo', () => ({
  useLightwellNavigateTo: jest.fn(),
}));

jest.mock('Hooks/useNotification', () => () => ({ notify: () => null }));
jest.mock('Hooks/useErrorNotification', () => () => jest.fn());

const mockNavigateTo = jest.fn();

const sampleToken: LightwellTokenResponse = {
  uuid: 'token-uuid',
  org_id: 'org-1',
  user_id: 'user-1',
  name: 'ci-token',
  token_prefix: 'lw_abcdefg',
  expires_at: '2027-01-01T00:00:00Z',
  last_used_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

const renderTokensTable = () =>
  render(
    <ReactQueryTestWrapper>
      <TokensTable />
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  mockNavigateTo.mockReset();
  (useLightwellNavigateTo as jest.Mock).mockReturnValue({ navigateTo: mockNavigateTo });
  (useIsOrgAdmin as jest.Mock).mockReturnValue({ isOrgAdmin: true, isLoading: false });
  (useAppContext as jest.Mock).mockReturnValue({
    features: { lightwell: { enabled: true, accessible: true } },
    rbac: { repoRead: true, repoWrite: true },
    isFetchingPermissions: false,
  });
  (useCreateLightwellToken as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn(),
    isPending: false,
  });
});

it('renders token rows from the list query', async () => {
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [sampleToken],
  });

  renderTokensTable();

  expect(await screen.findByText('ci-token')).toBeInTheDocument();
  expect(screen.getByText('lw_abcdefg…')).toBeInTheDocument();
  expect(screen.getByText('user-1')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Create access token' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Revoke' })).toBeInTheDocument();
});

it('opens revoke confirmation from the row action', async () => {
  const user = userEvent.setup();
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [sampleToken],
  });

  renderTokensTable();

  await user.click(await screen.findByRole('button', { name: 'Revoke' }));
  expect(await screen.findByText('Revoke access token?')).toBeInTheDocument();
});

it('shows empty state when there are no tokens', async () => {
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [],
  });

  renderTokensTable();

  expect(await screen.findByText('No access tokens')).toBeInTheDocument();
});

it('hides revoked tokens behind a disclosure until expanded', async () => {
  const user = userEvent.setup();
  const revokedToken: LightwellTokenResponse = {
    ...sampleToken,
    uuid: 'revoked-uuid',
    name: 'old-token',
    token_prefix: 'lw_revoked',
    revoked_at: '2026-02-01T00:00:00Z',
  };
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [sampleToken, revokedToken],
  });

  renderTokensTable();

  expect(await screen.findByText('ci-token')).toBeInTheDocument();
  expect(screen.getByText('old-token')).not.toBeVisible();
  expect(screen.getByRole('button', { name: 'Show revoked tokens (1)' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Show revoked tokens (1)' }));

  expect(screen.getByText('old-token')).toBeVisible();
  expect(screen.getByText('lw_revoked…')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Hide revoked tokens (1)' })).toBeInTheDocument();
});

it('keeps the create modal open after the first token is created from empty state', async () => {
  const user = userEvent.setup();
  const createMutateAsync = jest.fn().mockResolvedValue({
    ...sampleToken,
    token: 'lw_abcdefgh_secret',
  });
  (useCreateLightwellToken as jest.Mock).mockReturnValue({
    mutateAsync: createMutateAsync,
    isPending: false,
  });
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [],
  });

  const { rerender } = render(
    <ReactQueryTestWrapper>
      <TokensTable />
    </ReactQueryTestWrapper>,
  );

  // Empty state has toolbar + empty CTA; both open the same lifted modal.
  await user.click(screen.getAllByRole('button', { name: 'Create access token' })[0]);
  expect(await screen.findByRole('heading', { name: 'Create access token' })).toBeInTheDocument();

  await user.type(screen.getByLabelText(/Name/), 'ci-token');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('heading', { name: 'Access token created' })).toBeInTheDocument();
  expect(screen.getByDisplayValue('lw_abcdefgh_secret')).toBeInTheDocument();

  // Simulate list refresh after create (empty → one token). Modal must survive empty-state unmount.
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [sampleToken],
  });
  rerender(
    <ReactQueryTestWrapper>
      <TokensTable />
    </ReactQueryTestWrapper>,
  );

  expect(screen.getByRole('heading', { name: 'Access token created' })).toBeInTheDocument();
  expect(screen.getByDisplayValue('lw_abcdefgh_secret')).toBeInTheDocument();
});

it('hides create and revoke when the user lacks write permission', async () => {
  (useAppContext as jest.Mock).mockReturnValue({
    features: { lightwell: { enabled: true, accessible: true } },
    rbac: { repoRead: true, repoWrite: false },
    isFetchingPermissions: false,
  });
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [sampleToken],
  });

  renderTokensTable();

  expect(await screen.findByText('ci-token')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Create access token' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument();
});

it('shows no permissions for non-admins', async () => {
  (useIsOrgAdmin as jest.Mock).mockReturnValue({ isOrgAdmin: false, isLoading: false });
  (useLightwellTokensQuery as jest.Mock).mockReturnValue({
    isLoading: false,
    data: [],
  });

  renderTokensTable();

  expect(await screen.findByText('You do not have access')).toBeInTheDocument();
});
