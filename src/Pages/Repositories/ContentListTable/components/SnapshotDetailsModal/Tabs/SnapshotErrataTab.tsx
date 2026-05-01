import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentOrigin } from 'services/Content/ContentApi';
import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import { useGetSnapshotErrataQuery } from 'services/Content/ContentQueries';
import useAdvisoriesTableState from 'components/SharedTables/AdvisoriesTable/useAdvisoriesTableState';
import AdvisoriesTable from 'components/SharedTables/AdvisoriesTable';

export function SnapshotErrataTab() {
  const { contentOrigin } = useAppContext();
  const { snapshotUUID = '' } = useParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();

  const tableState = useAdvisoriesTableState('snapshotErrataPerPage');

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotErrataQuery(
    snapshotUUID,
    tableState.page,
    tableState.perPage,
    tableState.debouncedFilters.search,
    tableState.debouncedFilters.type,
    tableState.debouncedFilters.severity,
    tableState.sortString,
  );

  useEffect(() => {
    if (isError) {
      navigate(
        rootPath +
          (contentOrigin.length === 1 && contentOrigin[0] === ContentOrigin.REDHAT
            ? `?origin=${contentOrigin}`
            : ''),
      );
    }
  }, [isError]);

  const {
    data: errataList = [],
    meta: { count = 0 },
  } = data;

  return (
    <AdvisoriesTable
      errataList={errataList}
      count={count}
      isFetching={isFetching}
      isLoading={isLoading}
      ouiaIdPrefix='snapshot_errata'
      {...tableState}
    />
  );
}
