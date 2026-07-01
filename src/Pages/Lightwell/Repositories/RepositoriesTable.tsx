import { Grid } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Header from 'components/Header/Header';

const RepositoriesTable = () => (
  <>
    <Header
      title='Lightwell - Repositories'
      ouiaId='lightwell_header'
      paragraph='Open source libraries rebuilt securely with backported fixes for known vulnerabilities.'
    />
    <Grid className={`${spacing.pxLg} ${spacing.ptMd}`}>
      <EmptyTableState
        notFiltered
        itemName='repositories'
        notFilteredBody='No Lightwell repositories are available yet.'
        clearFilters={() => {}}
      />
    </Grid>
  </>
);

export default RepositoriesTable;
