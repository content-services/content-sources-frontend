import { ContentOrigin } from 'services/Content/ContentApi';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import { useGetSnapshotPackagesQuery } from 'services/Content/ContentQueries';
import PackagesTableWithToolbars from 'components/SharedTables/PackagesTable';
import { usePackageTableFilters } from 'components/SharedTables/PackagesTable/usePackageTableFilters';
import { usePackageTablePagination } from 'components/SharedTables/PackagesTable/usePackageTablePagination';

const perPageKey = 'snapshotPackagePerPage';

const useOnCloseNavigate = () => {
  const { contentOrigin } = useAppContext();
  const rootPath = useRootPath();
  const navigate = useNavigate();

  const onClose = () =>
    navigate(
      rootPath +
        (contentOrigin.length === 1 && contentOrigin[0] === ContentOrigin.REDHAT
          ? `?origin=${contentOrigin}`
          : ''),
    );

  return onClose;
};

export function SnapshotPackagesTab() {
  const { snapshotUUID = '' } = useParams();

  const onClose = useOnCloseNavigate();

  const filterData = usePackageTableFilters();
  const { debouncedSearch } = filterData;

  const paginationData = usePackageTablePagination({ perPageKey });
  const { page, perPage } = paginationData;

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotPackagesQuery(snapshotUUID, page, perPage, debouncedSearch);

  useEffect(() => {
    if (isError) {
      onClose();
    }
  }, [isError]);

  const {
    data: packagesList = [],
    meta: { count = 0 },
  } = data;

  const paginationProps = {
    itemCount: count,
    ...paginationData,
  };

  return (
    <PackagesTableWithToolbars
      packagesList={packagesList}
      paginationProps={paginationProps}
      isFetching={isFetching}
      isLoading={isLoading}
      count={count}
      filterProps={{ ...filterData }}
    />
  );
}
