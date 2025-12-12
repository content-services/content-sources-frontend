import { useHref } from 'react-router-dom';

import { Bullseye, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';

import { ADD_ROUTE, REPOSITORIES_ROUTE } from 'Routes/constants';

import {
  useOtherRepositoriesApi,
  useOtherRepositoriesState,
} from '../../store/OtherRepositoriesStore';

export const EmptyTable = () => {
  const { filterQuery } = useOtherRepositoriesState();
  const { clearFilterByName } = useOtherRepositoriesApi();

  const noFilterSet = filterQuery === '';

  return (
    <Bullseye data-ouia-component-id='custom_repositories_table'>
      <EmptyTableState
        notFiltered={noFilterSet}
        clearFilters={clearFilterByName}
        itemName='custom repositories'
        notFilteredBody='To get started, create a custom repository'
        notFilteredButton={<AddCustomRepositoryButton />}
      />
    </Bullseye>
  );
};

const AddCustomRepositoryButton = () => {
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';
  const href = pathname + '/' + REPOSITORIES_ROUTE + ADD_ROUTE;

  return (
    <Button
      id='createContentSourceButton'
      ouiaId='create_content_source'
      variant='primary'
      component='a'
      target='_blank'
      href={href}
      icon={<ExternalLinkAltIcon />}
      iconPosition='end'
    >
      Add repositories
    </Button>
  );
};
