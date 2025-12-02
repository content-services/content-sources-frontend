import { Content, ContentVariants, Title } from '@patternfly/react-core';

export const ReviewPageHeading = () => (
  <>
    <Title ouiaId='review' headingLevel='h1'>
      Review
    </Title>
    <Content component={ContentVariants.p}>
      Review the information and then click <b>Create</b>.
    </Content>
  </>
);
