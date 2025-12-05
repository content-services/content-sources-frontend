import { Grid } from '@patternfly/react-core';

import Hide from 'components/Hide/Hide';

import { EmptyTable } from './components/EmptyTable';
import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { TableHeading } from './components/TableHeading';
import { BottomPagination, TableControls } from './components/TableControls';
import { OtherRepositoriesTable } from './components/Table';

import { useOtherRepositoriesState } from '../store/OtherRepositoriesStore';

export default function OtherRepositories() {
  const { isLoading, count } = useOtherRepositoriesState();

  const noFetchedRepositories = count === 0;
  const isEmptyTable = noFetchedRepositories && !isLoading;
  const areReposLoading = noFetchedRepositories || isLoading;

  return (
    <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
      <TableHeading />
      <TableControls />
      {isEmptyTable ? (
        <EmptyTable />
      ) : (
        <>
          <TableLoadingSkeleton />
          <Hide hide={areReposLoading}>
            <OtherRepositoriesTable />
            <BottomPagination />
          </Hide>
        </>
      )}
    </Grid>
  );
}
