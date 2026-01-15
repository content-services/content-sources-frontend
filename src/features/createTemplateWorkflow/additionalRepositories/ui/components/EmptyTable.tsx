import {
  useAdditionalRepositoriesApi,
  useAdditionalRepositoriesState,
} from '../../store/AdditionalRepositoriesStore';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';

export const EmptyTable = () => {
  const { filterQuery } = useAdditionalRepositoriesState();
  const { clearFilterByName } = useAdditionalRepositoriesApi();

  const isNoFilterSet = filterQuery === '';

  return (
    <EmptyTableState
      notFiltered={isNoFilterSet}
      notFilteredBody='No Red Hat repositories match the version and arch'
      clearFilters={clearFilterByName}
      itemName='Red Hat repositories'
    />
  );
};
