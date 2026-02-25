import { Grid } from '@patternfly/react-core';
import Hide from 'components/Hide/Hide';
import { useRedhatRepositoriesApi } from '../store/RedhatRepositoriesStore';
import { RedhatRepositoriesTable } from './components/RedhatRepositoriesTable';
import { TableHeading } from './components/TableHeading';
import { TableBottomPagination, TableControls } from './components/TableControls';

import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { EmptyTable } from './components/EmptyTable';

export default function RedhatRepositoriesStep() {
  const { countIsZero, searchQuery, isLoading, showLoader } = useRedhatRepositoriesApi();

  return (
    <Grid hasGutter>
      <TableHeading />
      <Hide hide={(countIsZero && !searchQuery) || isLoading}>
        <TableControls />
      </Hide>
      {showLoader ? (
        <EmptyTable />
      ) : (
        <>
          <Hide hide={!isLoading}>
            <TableLoadingSkeleton />
          </Hide>
          <Hide hide={countIsZero || isLoading}>
            <RedhatRepositoriesTable />
            <Hide hide={countIsZero}>
              <TableBottomPagination />
            </Hide>
          </Hide>
        </>
      )}
    </Grid>
  );
}
