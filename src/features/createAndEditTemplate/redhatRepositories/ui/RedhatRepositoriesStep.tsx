import { Grid } from '@patternfly/react-core';
import { useRedhatRepositoriesState } from '../store/RedhatRepositoriesStore';
import { RedhatRepositoriesTable } from './components/RedhatRepositoriesTable';
import { TableHeading } from './components/TableHeading';
import { TableBottomPagination, TableControls } from './components/TableControls';

import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { EmptyTable } from './components/EmptyTable';

export default function RedhatRepositoriesStep() {
  const { isLoading, count } = useRedhatRepositoriesState();

  const noRepositories = count === 0;
  const isEmpty = noRepositories && !isLoading;

  if (isLoading) {
    return (
      <Grid hasGutter>
        <TableHeading />
        <TableLoadingSkeleton />
      </Grid>
    );
  }

  if (isEmpty) {
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
