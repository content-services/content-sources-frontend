import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnapshotDetailsModal, { SnapshotDetailTab } from './SnapshotDetailsModal';
import { useNavigateTo } from 'Hooks/navigation/useNavigateTo';

const mockUseNavigateTo = useNavigateTo as jest.Mock;
const mockSetSearchParams = jest.fn();

jest.mock('./Tabs/SnapshotPackagesTab', () => ({
  SnapshotPackagesTab: () => <div>Packages tab body</div>,
}));

jest.mock('./Tabs/SnapshotErrataTab', () => ({
  SnapshotErrataTab: () => <div>Errata tab body</div>,
}));

jest.mock('./SnapshotSelector', () => ({
  SnapshotSelector: () => <div>Snapshot selector</div>,
}));

jest.mock('Hooks/navigation/useNavigateTo', () => ({
  useNavigateTo: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({ snapshotUUID: 'snap-uuid' }),
  useSearchParams: () => {
    const params = new URLSearchParams(window.location.search);
    return [params, mockSetSearchParams];
  },
}));

describe('SnapshotDetailsModal', () => {
  beforeEach(() => {
    mockSetSearchParams.mockClear();
    window.history.replaceState({}, '', '/');
  });

  it('navigation hooks are called with the correct keys', async () => {
    render(<SnapshotDetailsModal />);

    expect(mockUseNavigateTo).toHaveBeenCalledWith('repositories');
    expect(mockUseNavigateTo).toHaveBeenCalledWith('repositorySnapshots');
  });

  it('syncs errata tab from search params on mount', async () => {
    window.history.replaceState({}, '', `/?tab=${SnapshotDetailTab.ERRATA}`);

    render(<SnapshotDetailsModal />);

    await waitFor(() => {
      expect(
        screen.getByRole('tabpanel', { name: 'Snapshot errata detail tab' }),
      ).toBeInTheDocument();
    });
  });

  it('updates search params when switching tabs', async () => {
    const user = userEvent.setup();

    render(<SnapshotDetailsModal />);

    await user.click(screen.getByRole('tab', { name: 'Snapshot errata detail tab' }));

    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: SnapshotDetailTab.ERRATA });
  });
});
