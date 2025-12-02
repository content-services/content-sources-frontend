import { Grid } from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';

import { SkeletonTable } from '@redhat-cloud-services/frontend-components';

import { COLUMNS_COUNT } from '../../core/domain/constants';

import { usePaginationState } from '../../store/AdditionalRepositoriesStore';

export const TableLoadingSkeleton = () => {
  const { perPage } = usePaginationState();

  return (
    <Grid className=''>
      <SkeletonTable rows={perPage} columnsCount={COLUMNS_COUNT} variant={TableVariant.compact} />
    </Grid>
  );
};
