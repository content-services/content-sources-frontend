import { EmptyState, EmptyStateBody, EmptyStateVariant, Grid } from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

export const NoPermissionsPage: React.FunctionComponent = () => (
  <>
    <Grid style={{ margin: '24px' }}>
      <EmptyState
        headingLevel='h5'
        icon={LockIcon}
        titleText='You do not have access'
        variant={EmptyStateVariant.full}
      >
        <EmptyStateBody>
          Contact your organization administrator(s) for more information.
        </EmptyStateBody>
      </EmptyState>
    </Grid>
  </>
);
