import { ThProps } from '@patternfly/react-table';
import { useCallback, useMemo, useState } from 'react';

type TableColumnIndex = number;
export type SortTableProps = (column: TableColumnIndex) => ThProps['sort'];

type SortDirection = 'asc' | 'desc';
type SortProps<T extends ReadonlyArray<string>> = {
  COLUMNS_TO_SORT: T;
};
type SortedColumnDirection<T extends ReadonlyArray<string>> = {
  [P in T[number]]: `${P}:${SortDirection}`;
}[T[number]];
type SortSettings<T extends ReadonlyArray<string>> = {
  sortedBy: SortedColumnDirection<T>;
  setSortProps: SortTableProps;
};
type SortTableColumn = <T extends ReadonlyArray<string>>(columns: SortProps<T>) => SortSettings<T>;
type CreateSort = <T extends ReadonlyArray<string>>(columns: T) => () => SortSettings<T>;

export const createUseSortRepositoriesList: CreateSort = (COLUMNS_TO_SORT) => () =>
  useSortRepositoriesListBase({ COLUMNS_TO_SORT });

const useSortRepositoriesListBase: SortTableColumn = ({ COLUMNS_TO_SORT }) => {
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<SortDirection>('asc');

  const sortedBy = useMemo(
    () => COLUMNS_TO_SORT[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  ) as SortedColumnDirection<typeof COLUMNS_TO_SORT>;

  const setSortProps = useCallback(
    (columnIndex: number): ThProps['sort'] => {
      const propsToSet = {
        sortBy: {
          index: activeSortIndex,
          direction: activeSortDirection,
          defaultDirection: 'asc' as SortDirection, // starting sort direction when first sorting a column. Defaults to 'asc'
        },
        onSort: (_event, index, direction) => {
          setActiveSortIndex(index);
          setActiveSortDirection(direction);
        },
        columnIndex,
      };
      return COLUMNS_TO_SORT[columnIndex] ? propsToSet : undefined;
    },
    [activeSortIndex, activeSortDirection],
  );

  return { sortedBy, setSortProps };
};
