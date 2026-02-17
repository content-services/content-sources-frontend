import { Content, ContentVariants, Title } from '@patternfly/react-core';
import { useReviewTemplateApi } from '../../../../createAndEditTemplate/reviewTemplateRequest/store/ReviewTemplateStore';

export const ReviewHeading = () => {
  const { isEdit } = useReviewTemplateApi();
  return (
    <>
      <Title ouiaId='review' headingLevel='h1'>
        Review
      </Title>
      <Content component={ContentVariants.p}>
        Review the information and then click <b>{isEdit ? 'Confirm changes' : 'Create'}</b>.
      </Content>
    </>
  );
};
