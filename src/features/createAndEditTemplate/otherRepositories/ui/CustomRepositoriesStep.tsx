import { Grid } from '@patternfly/react-core';
import Hide from 'components/Hide/Hide';
import { TableHeading } from './components/TableHeading';
import { TableBottomPagination, TableControls } from './components/TableControls';
import { EmptyTable } from './components/EmptyTable';
import { TableLoadingSkeleton } from './components/TableLoadingSkeleton';
import { CustomRepositoriesTable } from './components/CustomRepositoriesTable';
import { useCustomRepositoriesApi } from '../store/CustomRepositoriesStore';

export default function CustomRepositoriesStep() {
  const { countIsZero, searchQuery, isLoading, showLoader } = useCustomRepositoriesApi();

  return (
    <Grid data-ouia-component-id='custom_repositories_step' hasGutter>
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
            <CustomRepositoriesTable />
            <Hide hide={countIsZero}>
              <TableBottomPagination />
            </Hide>
          </Hide>
        </>
      )}
    </Grid>
  );
}
