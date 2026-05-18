import { useCallback, useMemo, useState } from 'react';
import {
  useDataViewFilters,
  useDataViewSort,
} from '@patternfly/react-data-view/dist/dynamic/Hooks';
import type { OnSetPage, OnPerPageSelect } from '@patternfly/react-core';
import type { ThProps } from '@patternfly/react-table';
import useDebounce from 'Hooks/useDebounce';
import { type ErrataFilters, initialErrataFilters, errataSortColumns } from './constants';

export default function useAdvisoriesTableState(perPageKey: string) {
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);

  const { filters, onSetFilters, clearAllFilters } = useDataViewFilters<ErrataFilters>({
    initialFilters: initialErrataFilters,
  });

  const debouncedFilters = useDebounce(
    filters,
    !filters.search && !filters.type.length && !filters.severity.length ? 0 : 500,
  );

  const { sortBy, direction, onSort } = useDataViewSort({
    defaultDirection: 'asc',
  });

  const sortString = useMemo(() => {
    if (!sortBy || !direction) return '';
    const column = errataSortColumns.find((col) => col.name === sortBy);
    if (!column?.sortAttribute) return '';
    return `${column.sortAttribute}:${direction}`;
  }, [sortBy, direction]);

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] => {
      const activeSortIndex = sortBy
        ? errataSortColumns.findIndex((col) => col.name === sortBy)
        : -1;
      return {
        sortBy: { index: activeSortIndex, direction, defaultDirection: 'asc' },
        onSort: (_event, index, dir) => onSort(_event, errataSortColumns[index].name, dir),
        columnIndex,
      };
    },
    [sortBy, direction, onSort],
  );

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

  const [filtersActiveAttributeResetKey, setFiltersActiveAttributeResetKey] = useState(0);

  const clearAllFiltersAndResetPage = useCallback(() => {
    clearAllFilters();
    setFiltersActiveAttributeResetKey((current) => current + 1);
    setPage(1);
  }, [clearAllFilters]);

  const handleFilterChange = useCallback(
    (_key: string, newValues: Partial<ErrataFilters>) => {
      onSetFilters(newValues);
      setPage(1);
    },
    [onSetFilters],
  );

  const paginationProps = {
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

  return {
    page,
    perPage,
    filters,
    debouncedFilters,
    sortString,
    getSortParams,
    isFiltered,
    clearAllFiltersAndResetPage,
    filtersActiveAttributeResetKey,
    handleFilterChange,
    paginationProps,
  };
}
