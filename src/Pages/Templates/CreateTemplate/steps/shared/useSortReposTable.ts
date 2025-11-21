import { ThProps } from '@patternfly/react-table';
import { useCallback, useMemo, useState } from 'react';

type SortDirection = 'asc' | 'desc';

export const createUseSortRepositoriesList = (COLUMNS_TO_SORT) => () =>
  useSortRepositoriesListBase({ COLUMNS_TO_SORT });

const useSortRepositoriesListBase = ({ COLUMNS_TO_SORT }) => {
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<SortDirection>('asc');

  const sortedBy = useMemo(
    () => COLUMNS_TO_SORT[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

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
