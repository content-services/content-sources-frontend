import { Content, ExpandableSection, Flex } from '@patternfly/react-core';
import { useReviewTemplateState } from '../../store/ReviewTemplateStore';

export const ReviewTemplateContent = () => {
  const { templateReview } = useReviewTemplateState();

  return (
    <>
      {Object.keys(templateReview).map((key, index) => (
        <ExpandableSection
          key={key}
          isIndented
          toggleText={key}
          isExpanded={true}
          aria-label={`${key}-expansion`}
          data-ouia-component-id={`${key}_expansion`}
        >
          <Flex direction={{ default: 'row' }}>
            <Flex direction={{ default: 'column' }}>
              {Object.keys(templateReview[key]).map((key) => (
                <Content component='p' key={key + '' + index}>
                  {key}
                </Content>
              ))}
            </Flex>
            <Flex direction={{ default: 'column' }}>
              {Object.values(templateReview[key]).map((value, index) => (
                <Content component='p' key={value + '' + index}>
                  {value}
                </Content>
              ))}
            </Flex>
          </Flex>
        </ExpandableSection>
      ))}
    </>
  );
};
