import { act, renderHook } from '@testing-library/react';
import { useGetRepoConfigFileQuery } from 'services/Content/ContentQueries';
import useErrorNotification from 'Hooks/useErrorNotification';
import { useRepoConfig } from './useRepoConfig';

jest.mock('services/Content/ContentQueries', () => ({
  useGetRepoConfigFileQuery: jest.fn(),
}));

jest.mock('Hooks/useErrorNotification');

const config = '[repo]\nbaseurl=https://example.com/repo/';
const mutateAsync = jest.fn();
const errorNotifier = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mutateAsync.mockReset().mockResolvedValue(config);
  (useGetRepoConfigFileQuery as jest.Mock).mockReturnValue({ mutateAsync });
  (useErrorNotification as jest.Mock).mockReturnValue(errorNotifier);
});

it('copies the config of a specific snapshot to the clipboard', async () => {
  // Each test file gets a fresh jsdom, so no restore needed
  const writeText = jest.fn();
  Object.assign(navigator, { clipboard: { writeText } });
  const { result } = renderHook(() => useRepoConfig('repo-1', 'snap-1'));

  await act(() => result.current.copyRepoConfig());

  expect(useGetRepoConfigFileQuery).toHaveBeenCalledWith('repo-1', 'snap-1');
  expect(writeText).toHaveBeenCalledWith(config);
  expect(result.current.copied).toBe(true);
});

it('does not copy when fetching the config fails', async () => {
  mutateAsync.mockRejectedValue(new Error('fetch failed'));
  const writeText = jest.fn();
  Object.assign(navigator, { clipboard: { writeText } });
  const { result } = renderHook(() => useRepoConfig('repo-1'));

  await act(() => result.current.copyRepoConfig());

  expect(writeText).not.toHaveBeenCalled();
  expect(errorNotifier).not.toHaveBeenCalled();
  expect(result.current.copied).toBe(false);
});

it('notifies when the clipboard copy fails', async () => {
  const err = new DOMException('Write permission denied', 'NotAllowedError');
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(err) } });
  const { result } = renderHook(() => useRepoConfig('repo-1'));

  await act(() => result.current.copyRepoConfig());

  expect(errorNotifier).toHaveBeenCalledWith(
    'Unable to copy repository configuration',
    'Try again, or download the file instead.',
    err,
    'repo-config-copy-error',
  );
  expect(result.current.copied).toBe(false);
});

it('downloads the config of the latest snapshot and releases the object URL', async () => {
  URL.createObjectURL = jest.fn().mockReturnValue('blob:repo-config');
  URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();
  const { result } = renderHook(() => useRepoConfig('repo-1'));

  await result.current.downloadRepoConfig();

  const link = click.mock.contexts[0] as HTMLAnchorElement;
  expect(useGetRepoConfigFileQuery).toHaveBeenCalledWith('repo-1', undefined);
  expect(link.download).toBe('config.repo');
  expect(link.href).toBe('blob:repo-config');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:repo-config');
});
