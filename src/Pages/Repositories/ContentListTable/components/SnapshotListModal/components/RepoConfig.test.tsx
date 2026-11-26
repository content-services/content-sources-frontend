import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRepoConfig } from '../hooks/useRepoConfig';
import RepoConfig from './RepoConfig';

jest.mock('../hooks/useRepoConfig');

const copyRepoConfig = jest.fn();
const downloadRepoConfig = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRepoConfig as jest.Mock).mockReturnValue({
    copyRepoConfig,
    downloadRepoConfig,
    copied: false,
  });
});

describe('RepoConfig', () => {
  it('copies the snapshot config', async () => {
    render(<RepoConfig repoUUID='repo-1' snapUUID='snap-1' />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Copy repository config' }));

    expect(useRepoConfig).toHaveBeenCalledWith('repo-1', 'snap-1');
    expect(copyRepoConfig).toHaveBeenCalled();
  });

  it('labels the copy button as copied after a successful copy', () => {
    (useRepoConfig as jest.Mock).mockReturnValue({
      copyRepoConfig,
      downloadRepoConfig,
      copied: true,
    });
    render(<RepoConfig repoUUID='repo-1' snapUUID='snap-1' />);

    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('downloads the snapshot config', async () => {
    render(<RepoConfig repoUUID='repo-1' snapUUID='snap-1' />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Download repository config' }));

    expect(useRepoConfig).toHaveBeenCalledWith('repo-1', 'snap-1');
    expect(downloadRepoConfig).toHaveBeenCalled();
  });
});
