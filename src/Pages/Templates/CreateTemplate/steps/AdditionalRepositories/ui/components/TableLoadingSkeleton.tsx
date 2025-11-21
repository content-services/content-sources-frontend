import { Grid } from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';

import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import Hide from 'components/Hide/Hide';

import { COLUMNS_COUNT } from '../../core/constants';

import {
  useAdditionalRepositoriesState,
  usePaginationState,
} from '../../store/AdditionalRepositoriesStore';

export const TableLoadingSkeleton = () => {
  const { isLoading } = useAdditionalRepositoriesState();
  const { perPage } = usePaginationState();

  return (
    <Hide hide={!isLoading}>
      <Grid className=''>
        <SkeletonTable rows={perPage} columnsCount={COLUMNS_COUNT} variant={TableVariant.compact} />
      </Grid>
    </Hide>
  );
};
