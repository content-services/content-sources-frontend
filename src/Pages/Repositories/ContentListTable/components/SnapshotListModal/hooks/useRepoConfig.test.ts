import { renderHook } from '@testing-library/react';
import { useGetRepoConfigFileQuery } from 'services/Content/ContentQueries';
import { useRepoConfig } from './useRepoConfig';

jest.mock('services/Content/ContentQueries', () => ({
  useGetRepoConfigFileQuery: jest.fn(),
}));

const config = '[repo]\nbaseurl=https://example.com/repo/';
const mutateAsync = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mutateAsync.mockReset().mockResolvedValue(config);
  (useGetRepoConfigFileQuery as jest.Mock).mockReturnValue({ mutateAsync });
});

it('copies the config of a specific snapshot to the clipboard', async () => {
  // Each test file gets a fresh jsdom, so no restore needed
  const writeText = jest.fn();
  Object.assign(navigator, { clipboard: { writeText } });
  const { result } = renderHook(() => useRepoConfig('repo-1', 'snap-1'));

  await result.current.copyRepoConfig();

  expect(useGetRepoConfigFileQuery).toHaveBeenCalledWith('repo-1', 'snap-1');
  expect(writeText).toHaveBeenCalledWith(config);
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
