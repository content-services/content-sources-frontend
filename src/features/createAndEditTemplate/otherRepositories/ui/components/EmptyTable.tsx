import { Bullseye, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { ADD_ROUTE, REPOSITORIES_ROUTE } from 'Routes/constants';
import { useCustomRepositoriesApi } from '../../../../createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore';

export const EmptyTable = () => {
  const { searchQuery, setSearchQuery, pathname } = useCustomRepositoriesApi();

  return (
    <Bullseye data-ouia-component-id='custom_repositories_table'>
      <EmptyTableState
        notFiltered={searchQuery === ''}
        clearFilters={() => setSearchQuery('')}
        itemName='custom repositories'
        notFilteredBody='To get started, create a custom repository'
        notFilteredButton={
          <Button
            id='createContentSourceButton'
            ouiaId='create_content_source'
            variant='primary'
            component='a'
            target='_blank'
            href={pathname + '/' + REPOSITORIES_ROUTE + '/' + ADD_ROUTE}
            icon={<ExternalLinkAltIcon />}
            iconPosition='end'
          >
            Add repositories
          </Button>
        }
      />
    </Bullseye>
  );
};
