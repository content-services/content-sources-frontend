import { render, screen } from '@testing-library/react';
import type { Package } from 'services/Content/ContentApi';
import { defaultPackageItem } from 'testingHelpers';
import { usePaginationLocalStorage } from 'Hooks/tables/usePaginationLocalStorage';
import PackagesTableWithToolbars from './PackagesTableWithToolbars';
import { usePackageTableFilters } from './hooks/usePackageTableFilters';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const PackagesTableHarness = ({
  packagesList,
  count,
  isLoading = false,
  isFetching = false,
  enabledBulkDelete = false,
  enabledRowActions = false,
}: {
  packagesList: Package[];
  count: number;
  isLoading?: boolean;
  isFetching?: boolean;
  enabledBulkDelete?: boolean;
  enabledRowActions?: boolean;
}) => {
  const paginationData = usePaginationLocalStorage({ key: 'test-packages-per-page' });
  const filterProps = usePackageTableFilters();

  return (
    <PackagesTableWithToolbars
      packagesList={packagesList}
      isLoading={isLoading}
      isFetching={isFetching}
      count={count}
      paginationData={paginationData}
      filterProps={filterProps}
      enabledBulkDelete={enabledBulkDelete}
      enabledRowActions={enabledRowActions}
    />
  );
};

describe('PackagesTableWithToolbars', () => {
  it('renders package rows with name, version, release, and architecture', () => {
    render(<PackagesTableHarness packagesList={[defaultPackageItem]} count={1} />);

    expect(screen.getByText(defaultPackageItem.name)).toBeInTheDocument();
    expect(screen.getByText(defaultPackageItem.version)).toBeInTheDocument();
    expect(screen.getByText(defaultPackageItem.release)).toBeInTheDocument();
    expect(screen.getByText(defaultPackageItem.arch)).toBeInTheDocument();
  });

  it('shows the zero-state empty body when there are no packages', () => {
    render(<PackagesTableHarness packagesList={[]} count={0} />);

    expect(screen.getByText('No packages')).toBeInTheDocument();
    expect(
      screen.getByText('You may need to add repositories that contain packages.'),
    ).toBeInTheDocument();
  });

  it('renders a row-actions kebab when enabledRowActions is set', () => {
    render(
      <PackagesTableHarness
        packagesList={[{ ...defaultPackageItem, uuid: 'pkg-1' } as Package]}
        count={1}
        enabledRowActions
      />,
    );

    expect(screen.getByRole('button', { name: 'Kebab toggle' })).toBeInTheDocument();
  });

  it('renders a bulk-select control when enabledBulkDelete is set', () => {
    render(
      <PackagesTableHarness
        packagesList={[{ ...defaultPackageItem, uuid: 'pkg-1' } as Package]}
        count={1}
        enabledBulkDelete
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'Select page' })).toBeInTheDocument();
  });
});
