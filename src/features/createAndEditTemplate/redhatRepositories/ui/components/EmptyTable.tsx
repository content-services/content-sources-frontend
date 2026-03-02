import { Bullseye } from '@patternfly/react-core';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import {
  useRedhatRepositoriesApi,
  useRedhatRepositoriesState,
} from '../../store/RedhatRepositoriesStore';

export const EmptyTable = () => {
  const { filterQuery } = useRedhatRepositoriesState();
  const { clearFilterByName } = useRedhatRepositoriesApi();

  const isNoFilterSet = filterQuery === '';

  return (
    <Bullseye data-ouia-component-id='redhat_repositories_table'>
      <EmptyTableState
        notFiltered={isNoFilterSet}
        clearFilters={clearFilterByName}
        itemName='Red Hat repositories'
        notFilteredBody='No Red Hat repositories match the version and arch'
      />
    </Bullseye>
  );
};
