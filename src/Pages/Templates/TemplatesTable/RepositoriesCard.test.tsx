import { render } from '@testing-library/react';
import { RepositoriesCard } from './RepositoriesCard';
import { useCountEachRepositoryType } from 'Hooks/useCountEachRepositoryType';
import { useNavigateTo } from 'Hooks/navigation/useNavigateTo';

jest.mock('Hooks/useCountEachRepositoryType', () => ({
  useCountEachRepositoryType: jest.fn(),
}));

jest.mock('Hooks/navigation/useNavigateTo', () => ({
  useNavigateTo: jest.fn(() => jest.fn()),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RepositoriesCard', () => {
  it('renders all positive counts correctly', () => {
    (useCountEachRepositoryType as jest.Mock).mockReturnValue({
      redhatCount: 15,
      epelCount: 8,
      customCount: 3,
      isLoading: false,
    });

    const { getByText } = render(<RepositoriesCard />);

    expect(getByText('15')).toBeInTheDocument();
    expect(getByText('Red Hat Repositories')).toBeInTheDocument();
    expect(getByText('8')).toBeInTheDocument();
    expect(getByText('EPEL Repositories')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('Custom Repositories')).toBeInTheDocument();
  });

  it('renders the card title', () => {
    const { getByText } = render(<RepositoriesCard />);

    expect(getByText('Available repositories')).toBeInTheDocument();
  });

  it('renders the Manage Repositories button', () => {
    const { getByText } = render(<RepositoriesCard />);

    expect(getByText('Manage repositories')).toBeInTheDocument();
  });

  it('calls useNavigateTo with repositories', () => {
    render(<RepositoriesCard />);

    expect(useNavigateTo).toHaveBeenCalledWith('repositories');
  });

  it('renders skeleton placeholders while loading', () => {
    (useCountEachRepositoryType as jest.Mock).mockReturnValue({
      redhatCount: 0,
      epelCount: 0,
      customCount: 0,
      isLoading: true,
    });

    const { queryByText, getAllByRole } = render(<RepositoriesCard />);

    expect(queryByText('Red Hat Repositories')).not.toBeInTheDocument();
    expect(queryByText('EPEL Repositories')).not.toBeInTheDocument();
    expect(queryByText('Custom Repositories')).not.toBeInTheDocument();
    expect(getAllByRole('progressbar')).toHaveLength(3);
  });
});
