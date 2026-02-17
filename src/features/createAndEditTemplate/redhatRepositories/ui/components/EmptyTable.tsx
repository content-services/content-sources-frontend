import { Bullseye } from '@patternfly/react-core';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { useRedhatRepositoriesApi } from '../../../../createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore';

export const EmptyTable = () => {
  const { searchQuery, setSearchQuery } = useRedhatRepositoriesApi();
  return (
    <Bullseye data-ouia-component-id='redhat_repositories_table'>
      <EmptyTableState
        notFiltered={searchQuery === ''}
        clearFilters={() => setSearchQuery('')}
        itemName='Red Hat repositories'
        notFilteredBody='No Red Hat repositories match the version and arch'
      />
    </Bullseye>
  );
};
