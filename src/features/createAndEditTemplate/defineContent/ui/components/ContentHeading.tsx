import { Content, ContentVariants, Title } from '@patternfly/react-core';

export const ContentHeading = () => (
  <>
    <Title ouiaId='define_template_content' headingLevel='h1'>
      Define template content
    </Title>
    <Content component={ContentVariants.p}>
      Templates provide consistent content across environments and time. They enable you to control
      the scope of package and advisory updates that will be installed on selected systems.
    </Content>

    <Title headingLevel='h3'>Preselect available content</Title>
    <Content component={ContentVariants.p}>
      Based on your filters, the base repositories will be added to this template.
    </Content>
  </>
);
