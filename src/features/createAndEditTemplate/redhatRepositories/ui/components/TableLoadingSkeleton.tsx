import { Grid } from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import { useRedhatRepositoriesApi } from '../../../../createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore';

export const TableLoadingSkeleton = () => {
  const { perPage, columnHeaders } = useRedhatRepositoriesApi();
  return (
    <Grid className=''>
      <SkeletonTable
        rows={perPage}
        columnsCount={columnHeaders.length}
        variant={TableVariant.compact}
      />
    </Grid>
  );
};
