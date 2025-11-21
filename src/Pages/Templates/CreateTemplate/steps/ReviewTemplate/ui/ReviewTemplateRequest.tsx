import { Grid } from '@patternfly/react-core';
import { ReviewTemplateContent } from './components/ReviewTemplateContent';
import { ReviewPageHeading } from './components/ReviewPageHeading';

export default function ReviewTemplateRequest() {
  return (
    <Grid hasGutter>
      <ReviewPageHeading />
      <ReviewTemplateContent />
    </Grid>
  );
}
