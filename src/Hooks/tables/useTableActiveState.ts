import { useMemo } from 'react';
import { DataViewState } from '@patternfly/react-data-view/dist/dynamic/DataView';

export default function useTableActiveState(
  isLoading: boolean,
  count: number,
  isFetching = false,
): DataViewState | undefined {
  return useMemo(() => {
    if (isLoading || isFetching) return DataViewState.loading;
    return count === 0 ? DataViewState.empty : undefined;
  }, [isLoading, isFetching, count]);
}
