import { Grid } from '@patternfly/react-core';
import { VersionsPageHeading } from './components/VersionsPageHeading';
import { VersionsDropdownGroup } from './components/VersionsDropdownGroup';
import { VersionsPageExplanation } from './components/VersionsPageExplanation';

export default function VersionDefinitions() {
  return (
    <Grid hasGutter>
      <VersionsPageHeading />
      <VersionsDropdownGroup />
      <VersionsPageExplanation />
    </Grid>
  );
}
