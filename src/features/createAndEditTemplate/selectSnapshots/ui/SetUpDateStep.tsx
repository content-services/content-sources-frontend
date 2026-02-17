import { Grid } from '@patternfly/react-core';
import { SnapshotPageHeading } from './components/SnapshotPageHeading';
import { SnapshotPicker } from './components/SnapshotPicker';
import { DependencyNotification } from './components/DependencyNotification';

export default function SetUpDateStep() {
  return (
    <Grid hasGutter>
      <SnapshotPageHeading />
      <SnapshotPicker />
      <DependencyNotification />
    </Grid>
  );
}
