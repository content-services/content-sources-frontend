import { Grid } from '@patternfly/react-core';
import { ContentHeading } from './components/ContentHeading';
import { ContentPageExplanation } from './components/ContentPageExplanation';
import { DropdownGroup } from './components/DropdownGroup';

export default function DefineContentStep() {
  return (
    <Grid hasGutter>
      <ContentHeading />
      <DropdownGroup />
      <ContentPageExplanation />
    </Grid>
  );
}
