import { TableVariant } from '@patternfly/react-table';
import { Grid } from '@patternfly/react-core';

import Hide from 'components/Hide/Hide';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';

import { COLUMNS_COUNT } from '../../core/constants';

import { useOtherRepositoriesState, usePaginationState } from '../../store/OtherRepositoriesStore';

export const TableLoadingSkeleton = () => {
  const { isLoading } = useOtherRepositoriesState();
  const { perPage } = usePaginationState();

  return (
    <Hide hide={!isLoading}>
      <Grid className=''>
        <SkeletonTable rows={perPage} columnsCount={COLUMNS_COUNT} variant={TableVariant.compact} />
      </Grid>
    </Hide>
  );
};
