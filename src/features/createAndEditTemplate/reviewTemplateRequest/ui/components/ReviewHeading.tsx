import { Content, ContentVariants, Title } from '@patternfly/react-core';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';

export const ReviewHeading = () => {
  const { isEditTemplate } = useEditTemplateState();
  return (
    <>
      <Title ouiaId='review' headingLevel='h1'>
        Review
      </Title>
      <Content component={ContentVariants.p}>
        Review the information and then click <b>{isEditTemplate ? 'Confirm changes' : 'Create'}</b>
        .
      </Content>
    </>
  );
};
