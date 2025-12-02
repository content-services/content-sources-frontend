import { Grid } from '@patternfly/react-core';

import { EmptyTable } from './components/EmptyTable';
import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { TableHeading } from './components/TableHeading';
import { TableBottomPagination, TableControls } from './components/TableControls';
import { OtherRepositoriesTable } from './components/Table';

import { useOtherRepositoriesState } from '../store/OtherRepositoriesStore';

export default function OtherRepositoriesSection() {
  const { isLoading, count } = useOtherRepositoriesState();

  const noRepositories = count === 0;
  const isEmpty = noRepositories && !isLoading;

  if (isLoading) {
    return (
      <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
        <TableHeading />
        <TableLoadingSkeleton />
      </Grid>
    );
  }

  if (isEmpty) {
    <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
      <TableHeading />
      <TableControls />
      <EmptyTable />
    </Grid>;
  }

  return (
    <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
      <TableHeading />
      <TableControls />
      <OtherRepositoriesTable />
      <TableBottomPagination />
    </Grid>
  );
}
