import { Pagination, OnSetPage, OnPerPageSelect } from '@patternfly/react-core';
import {
  DataView,
  DataViewState,
  DataViewToolbar,
  DataViewTextFilter,
  DataViewCheckboxFilter,
  useDataViewFilters,
  useDataViewSort,
} from '@patternfly/react-data-view';
import { DataViewFilters } from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';
import type { DataViewFilterOption } from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDebounce from 'Hooks/useDebounce';
import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import { useGetSnapshotErrataQuery } from 'services/Content/ContentQueries';
import AdvisoriesTable from 'components/SharedTables/AdvisoriesTable';
import { ThProps } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface SnapshotErrataFilters {
  search: string;
  type: string[];
  severity: string[];
}

const initialFilters: SnapshotErrataFilters = { search: '', type: [], severity: [] };
const perPageKey = 'snapshotErrataPerPage';

const typeFilterOptions: DataViewFilterOption[] = [
  { label: 'Security', value: 'Security' },
  { label: 'Bugfix', value: 'Bugfix' },
  { label: 'Enhancement', value: 'Enhancement' },
  { label: 'Other', value: 'Other' },
];

const severityFilterOptions: DataViewFilterOption[] = [
  { label: 'Critical', value: 'Critical' },
  { label: 'Important', value: 'Important' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Low', value: 'Low' },
  { label: 'None', value: 'None' },
];

const columns = [
  { name: 'Name', sortAttribute: 'name' },
  { name: 'Synopsis', sortAttribute: 'synopsis' },
  { name: 'Type', sortAttribute: 'type' },
  { name: 'Severity', sortAttribute: 'severity' },
  { name: 'Publish date', sortAttribute: 'issued_date' },
];

export function SnapshotErrataTab() {
  const { contentOrigin } = useAppContext();
  const { snapshotUUID = '' } = useParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();

  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);

  const { filters, onSetFilters, clearAllFilters } = useDataViewFilters<SnapshotErrataFilters>(
    { initialFilters },
  );

  const debouncedFilters = useDebounce(
    filters,
    !filters.search && !filters.type.length && !filters.severity.length ? 0 : 500,
  );

  const { sortBy, direction, onSort } = useDataViewSort({
    defaultDirection: 'asc',
  });

  const sortString = useMemo(() => {
    if (!sortBy || !direction) return '';
    const column = columns.find((col) => col.name === sortBy);
    if (!column?.sortAttribute) return '';
    return `${column.sortAttribute}:${direction}`;
  }, [sortBy, direction]);

  const getSortParams = (columnIndex: number): ThProps['sort'] => {
    const activeSortIndex = sortBy ? columns.findIndex((col) => col.name === sortBy) : -1;
    return {
      sortBy: { index: activeSortIndex, direction, defaultDirection: 'asc' },
      onSort: (_event, index, dir) => onSort(_event, columns[index].name, dir),
      columnIndex,
    };
  };

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotErrataQuery(
    snapshotUUID,
    page,
    perPage,
    debouncedFilters.search,
    debouncedFilters.type,
    debouncedFilters.severity,
    sortString,
  );

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
    data: errataList = [],
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

  const isFiltered = useMemo(
    () => !!(filters.search || filters.type.length || filters.severity.length),
    [filters],
  );

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
              ouiaId='name_search_snapshot_errata'
              title='Name/Synopsis'
              placeholder='Filter by name/synopsis'
            />
            <DataViewCheckboxFilter
              filterId='type'
              ouiaId='filter_type_snapshot_errata'
              title='Type'
              placeholder='Filter by type'
              options={typeFilterOptions}
            />
            <DataViewCheckboxFilter
              filterId='severity'
              ouiaId='filter_severity_snapshot_errata'
              title='Severity'
              placeholder='Filter by severity'
              options={severityFilterOptions}
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
      <AdvisoriesTable
        hasFilters={isFiltered}
        errataList={errataList}
        clearSearch={clearAllFiltersAndResetPage}
        perPage={perPage}
        sortParams={getSortParams}
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
