import { Grid } from '@patternfly/react-core';

import { RedhatRepositoriesTable } from './components/Table';
import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { TableBottomPagination, TableControls } from './components/TableControls';
import { EmptyTable } from './components/EmptyTable';
import { TableHeading } from './components/TableHeading';

import { useAdditionalRepositoriesState } from '../store/AdditionalRepositoriesStore';

export default function AdditionalRepositories() {
  const { isLoading, count } = useAdditionalRepositoriesState();

  const noFetchedRepositories = count === 0;
  const isEmptyTable = noFetchedRepositories && !isLoading;

  if (isLoading) {
    return (
      <Grid hasGutter>
        <TableHeading />
        <TableLoadingSkeleton />
      </Grid>
    );
  }

  if (isEmptyTable) {
    return (
      <Grid hasGutter>
        <TableHeading />
        <TableControls />
        <EmptyTable />
      </Grid>
    );
  }

  return (
    <Grid hasGutter>
      <TableHeading />
      <TableControls />
      <RedhatRepositoriesTable />
      <TableBottomPagination />
    </Grid>
  );
}
