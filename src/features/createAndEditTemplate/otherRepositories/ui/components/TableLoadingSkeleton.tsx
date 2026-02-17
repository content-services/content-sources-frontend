import { Grid } from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import { useCustomRepositoriesApi } from '../../../../createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore';

export const TableLoadingSkeleton = () => {
  const { perPage, columnHeaders } = useCustomRepositoriesApi();

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
