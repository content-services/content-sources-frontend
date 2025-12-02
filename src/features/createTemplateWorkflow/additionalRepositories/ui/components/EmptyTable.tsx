import { Bullseye } from '@patternfly/react-core';
import {
  useAdditionalRepositoriesApi,
  useAdditionalRepositoriesState,
} from '../../store/AdditionalRepositoriesStore';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';

export const EmptyTable = () => {
  const { filterQuery } = useAdditionalRepositoriesState();
  const { clearFilterByName } = useAdditionalRepositoriesApi();

  const noFilterSet = filterQuery === '';

  return (
    <Bullseye data-ouia-component-id='redhat_repositories_table'>
      <EmptyTableState
        notFiltered={noFilterSet}
        clearFilters={clearFilterByName}
        itemName='Red Hat repositories'
        notFilteredBody='No Red Hat repositories match the version and arch'
      />
    </Bullseye>
  );
};
