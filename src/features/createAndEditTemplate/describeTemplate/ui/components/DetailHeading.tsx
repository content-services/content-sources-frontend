import { Content, ContentVariants, Title } from '@patternfly/react-core';

export const DetailHeading = () => (
  <>
    <Title ouiaId='enter_template_details' headingLevel='h1'>
      Enter template details
    </Title>
    <Content component={ContentVariants.p}>
      Enter a name and a description for your template.
    </Content>
  </>
);
