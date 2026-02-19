import { Grid } from '@patternfly/react-core';
import { DetailHeading } from './components/DetailHeading';
import { DetailInputFields } from './components/DetailInputFields';

export default function DetailStep() {
  return (
    <Grid hasGutter>
      <DetailHeading />
      <DetailInputFields />
    </Grid>
  );
}
