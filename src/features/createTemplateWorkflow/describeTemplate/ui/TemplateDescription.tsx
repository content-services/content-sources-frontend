import { Form, Grid, Content, ContentVariants, Title } from '@patternfly/react-core';
import { TemplateTitle } from './components/TemplateTitle';
import { TemplateDetail } from './components/TemplateDetail';

export default function TemplateDescription() {
  return (
    <Grid hasGutter>
      <DescriptionPageHeading />
      <DescriptionInputFields />
    </Grid>
  );
}

const DescriptionPageHeading = () => (
  <>
    <Title ouiaId='enter_template_details' headingLevel='h1'>
      Enter template details
    </Title>
    <Content component={ContentVariants.p}>
      Enter a name and a description for your template.
    </Content>
  </>
);

const DescriptionInputFields = () => (
  <Form>
    <TemplateTitle />
    <TemplateDetail />
  </Form>
);
