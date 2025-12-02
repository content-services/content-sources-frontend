import { TableVariant } from '@patternfly/react-table';
import { Grid } from '@patternfly/react-core';

import { SkeletonTable } from '@redhat-cloud-services/frontend-components';

import { COLUMNS_COUNT } from '../../core/domain/constants';

import { usePagination } from '../../store/OtherRepositoriesStore';

export const TableLoadingSkeleton = () => {
  const { perPage } = usePagination();

  return (
    <Grid className=''>
      <SkeletonTable rows={perPage} columnsCount={COLUMNS_COUNT} variant={TableVariant.compact} />
    </Grid>
  );
};
