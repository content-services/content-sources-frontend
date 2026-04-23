import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RepoConfig from './RepoConfig';
import { ReactQueryTestWrapper } from 'testingHelpers';
import {
  useGetLatestRepoConfigFileQuery,
  useGetRepoConfigFileQuery,
} from 'services/Content/ContentQueries';

jest.mock('services/Content/ContentQueries', () => ({
  useGetRepoConfigFileQuery: jest.fn(),
  useGetLatestRepoConfigFileQuery: jest.fn(),
}));

describe('RepoConfig', () => {
  beforeEach(() => {
    (useGetRepoConfigFileQuery as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue('snapshot-repo-config'),
    });
    (useGetLatestRepoConfigFileQuery as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue('latest-repo-config'),
    });
  });

  it('uses latest snapshot query when latest is true', async () => {
    const user = userEvent.setup();
    const latestMutate = jest.fn().mockResolvedValue('cfg');
    (useGetLatestRepoConfigFileQuery as jest.Mock).mockReturnValue({ mutateAsync: latestMutate });

    render(
      <ReactQueryTestWrapper>
        <RepoConfig repoUUID='repo-1' snapUUID='snap-1' latest />
      </ReactQueryTestWrapper>,
    );

    await user.click(screen.getByRole('button', { name: 'Copy repository config' }));

    await waitFor(() => {
      expect(latestMutate).toHaveBeenCalled();
    });

    expect(useGetLatestRepoConfigFileQuery).toHaveBeenCalledWith('repo-1');
  });

  it('uses snapshot-specific query when latest is false', async () => {
    const user = userEvent.setup();
    const snapMutate = jest.fn().mockResolvedValue('cfg');
    (useGetRepoConfigFileQuery as jest.Mock).mockReturnValue({ mutateAsync: snapMutate });

    const createObjectURL = jest.fn(() => 'blob:mock');
    const originalCreate = global.URL.createObjectURL;
    global.URL.createObjectURL = createObjectURL;

    const anchorClick = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(
      <ReactQueryTestWrapper>
        <RepoConfig repoUUID='repo-1' snapUUID='snap-1' latest={false} />
      </ReactQueryTestWrapper>,
    );

    await user.click(screen.getByRole('button', { name: 'Download repository config' }));

    await waitFor(() => {
      expect(snapMutate).toHaveBeenCalled();
    });

    expect(useGetRepoConfigFileQuery).toHaveBeenCalledWith('repo-1', 'snap-1');
    expect(createObjectURL).toHaveBeenCalled();

    anchorClick.mockRestore();

    if (originalCreate) {
      global.URL.createObjectURL = originalCreate;
    } else {
      delete (global.URL as Partial<URL> & { createObjectURL?: unknown }).createObjectURL;
    }
  });
});
