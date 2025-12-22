import { Grid } from '@patternfly/react-core';

import { SnapshotPicker } from './components/SnapshotPicker';
import { DependencyNotification } from './components/DependencyNotification';
import { SnapshotPageHeading } from './components/SnapshotPageHeading';

export default function RepositoriesSnapshots() {
  return (
    <Grid hasGutter>
      <SnapshotPageHeading />
      <SnapshotPicker />
      <DependencyNotification />
    </Grid>
  );
}
