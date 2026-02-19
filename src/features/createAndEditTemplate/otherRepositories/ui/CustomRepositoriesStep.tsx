import { Grid } from '@patternfly/react-core';
import { TableHeading } from './components/TableHeading';
import { TableBottomPagination, TableControls } from './components/TableControls';
import { EmptyTable } from './components/EmptyTable';
import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { CustomRepositoriesTable } from './components/CustomRepositoriesTable';
import { useCustomRepositoriesState } from '../store/CustomRepositoriesStore';

export default function CustomRepositoriesStep() {
  const { isLoading, count } = useCustomRepositoriesState();

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
    return (
      <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
        <TableHeading />
        <TableControls />
        <EmptyTable />
      </Grid>
    );
  }

  return (
    <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
      <TableHeading />
      <TableControls />
      <CustomRepositoriesTable />
      <TableBottomPagination />
    </Grid>
  );
}
