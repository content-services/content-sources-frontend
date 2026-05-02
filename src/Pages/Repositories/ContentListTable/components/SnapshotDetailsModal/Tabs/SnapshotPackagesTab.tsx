import { Pagination, OnSetPage, OnPerPageSelect } from '@patternfly/react-core';
import { DataView, DataViewState } from '@patternfly/react-data-view/dist/dynamic/DataView';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { DataViewTextFilter } from '@patternfly/react-data-view/dist/dynamic/DataViewTextFilter';
import { DataViewFilters } from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';
import { useDataViewFilters } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { SkeletonTableBody } from '@patternfly/react-component-groups';
import EmptyTableDataView from 'components/EmptyTableDataView/EmptyTableDataView';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDebounce from 'Hooks/useDebounce';
import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import { useGetSnapshotPackagesQuery } from 'services/Content/ContentQueries';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface SnapshotPackagesFilters {
  search: string;
}

const initialFilters: SnapshotPackagesFilters = { search: '' };
const perPageKey = 'snapshotPackagePerPage';
const columnHeaders = ['Name', 'Version', 'Release', 'Architecture'];

export function SnapshotPackagesTab() {
  const { contentOrigin } = useAppContext();
  const { snapshotUUID = '' } = useParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();

  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);

  const { filters, onSetFilters, clearAllFilters } = useDataViewFilters<SnapshotPackagesFilters>({
    initialFilters,
  });

  const debouncedSearch = useDebounce(filters.search, !filters.search ? 0 : 500);

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

  const onClose = () =>
    navigate(
      rootPath +
        (contentOrigin.length === 1 && contentOrigin[0] === ContentOrigin.REDHAT
          ? `?origin=${contentOrigin}`
          : ''),
    );

  const {
    data: packagesList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const [activeState, setActiveState] = useState<DataViewState | undefined>(DataViewState.loading);

  useEffect(() => {
    if (fetchingOrLoading) {
      setActiveState(DataViewState.loading);
    } else {
      setActiveState(count === 0 ? DataViewState.empty : undefined);
    }
  }, [count, fetchingOrLoading]);

  const onSetPage: OnSetPage = (_event, newPage) => setPage(newPage);

  const onPerPageSelect: OnPerPageSelect = (_event, newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const clearAllFiltersAndResetPage = useCallback(() => {
    clearAllFilters();
    setPage(1);
  }, [clearAllFilters]);

  const rows = useMemo(
    () => packagesList.map((pkg) => [pkg.name, pkg.version, pkg.release, pkg.arch]),
    [packagesList],
  );

  const paginationProps = {
    itemCount: count,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

  return (
    <DataView activeState={activeState}>
      <DataViewToolbar
        className={spacing.ptMd}
        clearAllFilters={clearAllFiltersAndResetPage}
        filters={
          <DataViewFilters
            onChange={(_key, newValues) => {
              onSetFilters(newValues);
              setPage(1);
            }}
            values={filters}
          >
            <DataViewTextFilter
              filterId='search'
              ouiaId='name_search_snapshot_packages'
              title='Name'
              placeholder='Filter by name'
            />
          </DataViewFilters>
        }
        pagination={
          <Pagination
            id='top-pagination-id'
            widgetId='topPaginationWidgetId'
            {...paginationProps}
            isCompact
          />
        }
      />
      <DataViewTable
        aria-label='snapshot packages table'
        ouiaId='snapshot_packages_table'
        variant='compact'
        columns={columnHeaders}
        rows={rows}
        bodyStates={{
          empty: (
            <EmptyTableDataView
              ouiaId='snapshot_packages_table'
              itemName='packages'
              variant={filters.search ? 'filtered' : 'zero'}
              colSpan={columnHeaders.length}
              onClearFilters={clearAllFiltersAndResetPage}
              zeroBody='No packages found in this snapshot.'
            />
          ),
          loading: <SkeletonTableBody rowsCount={perPage} columnsCount={columnHeaders.length} />,
        }}
      />
      <DataViewToolbar
        pagination={
          <Pagination
            id='bottom-pagination-id'
            widgetId='bottomPaginationWidgetId'
            {...paginationProps}
            variant='bottom'
          />
        }
      />
    </DataView>
  );
}
