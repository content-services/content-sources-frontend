import { Grid } from '@patternfly/react-core';

import Hide from 'components/Hide/Hide';

import { RedhatRepositoriesTable } from './components/Table';
import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { BottomPagination, TableControls } from './components/TableControls';
import { EmptyTable } from './components/EmptyTable';
import { TableHeading } from './components/TableHeading';

import { useAdditionalRepositoriesState } from '../store/AdditionalRepositoriesStore';

export default function AdditionalRepositories() {
  const { isLoading, count } = useAdditionalRepositoriesState();

  const noFetchedRepositories = count === 0;
  const isEmptyTable = noFetchedRepositories && !isLoading;
  const areReposLoading = noFetchedRepositories || isLoading;

  return (
    <Grid hasGutter>
      <TableHeading />
      <TableControls />
      {isEmptyTable ? (
        <EmptyTable />
      ) : (
        <>
          <TableLoadingSkeleton />
          <Hide hide={areReposLoading}>
            <RedhatRepositoriesTable />
            <BottomPagination />
          </Hide>
        </>
      )}
    </Grid>
  );
}
