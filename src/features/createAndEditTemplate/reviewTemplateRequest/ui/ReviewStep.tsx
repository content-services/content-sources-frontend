import { Grid } from '@patternfly/react-core';
import { ReviewHeading } from './components/ReviewHeading';
import { ReviewTemplateContent } from './components/ReviewTemplateContent';

export default function ReviewStep() {
  return (
    <Grid hasGutter>
      <ReviewHeading />
      <ReviewTemplateContent />
    </Grid>
  );
}
