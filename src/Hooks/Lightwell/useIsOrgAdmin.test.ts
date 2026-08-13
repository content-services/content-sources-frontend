import { renderHook, waitFor } from '@testing-library/react';

import { useIsOrgAdmin, canManageLightwellTokens, canViewLightwellPackages } from './useIsOrgAdmin';

const mockGetUser = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

beforeEach(() => {
  mockGetUser.mockReset();
});

describe('canManageLightwellTokens / canViewLightwellPackages', () => {
  it('requires lightwell feature and org admin', () => {
    expect(canManageLightwellTokens({ lightwell: { enabled: true, accessible: true } }, true)).toBe(
      true,
    );
    expect(
      canManageLightwellTokens({ lightwell: { enabled: true, accessible: true } }, false),
    ).toBe(false);
    expect(
      canManageLightwellTokens({ lightwell: { enabled: true, accessible: false } }, true),
    ).toBe(false);
    expect(canManageLightwellTokens(null, true)).toBe(false);
    expect(canViewLightwellPackages({ lightwell: { enabled: true, accessible: true } }, true)).toBe(
      true,
    );
    expect(
      canViewLightwellPackages({ lightwell: { enabled: true, accessible: true } }, false),
    ).toBe(false);
  });
});

describe('useIsOrgAdmin', () => {
  it('returns true when identity marks the user as org admin', async () => {
    mockGetUser.mockResolvedValue({
      identity: { user: { is_org_admin: true } },
    });

    const { result } = renderHook(() => useIsOrgAdmin());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isOrgAdmin).toBe(false);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isOrgAdmin).toBe(true);
  });

  it('returns false when getUser fails', async () => {
    mockGetUser.mockRejectedValue(new Error('no auth'));

    const { result } = renderHook(() => useIsOrgAdmin());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isOrgAdmin).toBe(false);
  });
});
