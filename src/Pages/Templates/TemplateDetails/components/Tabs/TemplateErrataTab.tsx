import { useParams } from 'react-router-dom';
import { useFetchTemplateErrataQuery } from 'services/Templates/TemplateQueries';
import useAdvisoriesTableState from 'components/SharedTables/AdvisoriesTable/useAdvisoriesTableState';
import AdvisoriesTable from 'components/SharedTables/AdvisoriesTable';

export default function TemplateErrataTab() {
  const { templateUUID = '' } = useParams();

  const tableState = useAdvisoriesTableState('TemplateAdvisoriesPerPage');

  const {
    isLoading,
    isFetching,
    error,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useFetchTemplateErrataQuery(
    templateUUID,
    tableState.page,
    tableState.perPage,
    tableState.debouncedFilters.search,
    tableState.debouncedFilters.type,
    tableState.debouncedFilters.severity,
    tableState.sortString,
  );

  if (isError) {
    throw error;
  }

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
      ouiaIdPrefix='template_errata'
      {...tableState}
    />
  );
}
