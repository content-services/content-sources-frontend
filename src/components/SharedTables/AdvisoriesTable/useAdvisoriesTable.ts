import { useCallback, useMemo, useState } from 'react';
import {
  useDataViewFilters,
  useDataViewSort,
} from '@patternfly/react-data-view/dist/dynamic/Hooks';
import type { ThProps } from '@patternfly/react-table';
import useDebounce from 'Hooks/useDebounce';
import { type ErrataFilters, initialErrataFilters, columnsConfig } from './constants';
import { usePaginationLocalStorage } from 'Hooks/tables/usePaginationLocalStorage';

export default function useAdvisoriesTable({ paginationKey }: { paginationKey: string }) {
  const { page, perPage, onPerPageSelect, onSetPage, setPage } = usePaginationLocalStorage({
    key: paginationKey,
  });

  const paginationProps = {
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

  const { sortBy, direction, onSort } = useDataViewSort({
    defaultDirection: 'asc',
  });

  const sortString = useMemo(() => {
    if (!sortBy || !direction) return '';
    const column = columnsConfig.find((col) => col.name === sortBy);
    if (!column?.sortAttribute) return '';
    return `${column.sortAttribute}:${direction}`;
  }, [sortBy, direction]);

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] => {
      const activeSortIndex = sortBy ? columnsConfig.findIndex((col) => col.name === sortBy) : -1;
      return {
        sortBy: { index: activeSortIndex, direction, defaultDirection: 'asc' },
        onSort: (_event, index, dir) => onSort(_event, columnsConfig[index].name, dir),
        columnIndex,
      };
    },
    [sortBy, direction, onSort],
  );

  const { filters, onSetFilters, clearAllFilters } = useDataViewFilters<ErrataFilters>({
    initialFilters: initialErrataFilters,
  });

  const debouncedFilters = useDebounce(
    filters,
    !filters.search && !filters.type.length && !filters.severity.length ? 0 : 500,
  );

  const isFiltered = useMemo(
    () => !!(filters.search || filters.type.length || filters.severity.length),
    [filters],
  );

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
