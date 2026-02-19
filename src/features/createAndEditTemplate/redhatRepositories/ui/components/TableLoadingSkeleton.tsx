import { Grid } from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import { usePagination } from '../../store/RedhatRepositoriesStore';
import { COLUMNS_COUNT } from '../../core/domain/constants';

export const TableLoadingSkeleton = () => {
  const { perPage } = usePagination();
  return (
    <Grid className=''>
      <SkeletonTable rows={perPage} columnsCount={COLUMNS_COUNT} variant={TableVariant.compact} />
    </Grid>
  );
};
