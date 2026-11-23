import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRepoConfig } from '../hooks/useRepoConfig';
import LatestRepoConfig from './LatestRepoConfig';

jest.mock('../hooks/useRepoConfig');

const copyRepoConfig = jest.fn();
const downloadRepoConfig = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRepoConfig as jest.Mock).mockReturnValue({ copyRepoConfig, downloadRepoConfig });
});

describe('LatestRepoConfig', () => {
  it('copies the latest config', async () => {
    render(<LatestRepoConfig repoUUID='repo-1' />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Copy' }));

    expect(useRepoConfig).toHaveBeenCalledWith('repo-1');
    expect(copyRepoConfig).toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('downloads the latest config', async () => {
    render(<LatestRepoConfig repoUUID='repo-1' />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Download' }));

    expect(useRepoConfig).toHaveBeenCalledWith('repo-1');
    expect(downloadRepoConfig).toHaveBeenCalled();
  });
});
