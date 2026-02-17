import { Content, ExpandableSection, Flex } from '@patternfly/react-core';
import { useReviewTemplateApi } from '../../../../createAndEditTemplate/reviewTemplateRequest/store/ReviewTemplateStore';

export const ReviewTemplateContent = () => {
  const { reviewTemplate, setToggle, expanded } = useReviewTemplateApi();

  return (
    <>
      {Object.keys(reviewTemplate).map((key, index) => (
        <ExpandableSection
          key={key}
          isIndented
          toggleText={key}
          onToggle={() => setToggle(index)}
          isExpanded={expanded.has(index)}
          aria-label={`${key}-expansion`}
          data-ouia-component-id={`${key}_expansion`}
        >
          <Flex direction={{ default: 'row' }}>
            <Flex direction={{ default: 'column' }}>
              {Object.keys(reviewTemplate[key]).map((title) => (
                <Content component='p' key={title + '' + index}>
                  {title}
                </Content>
              ))}
            </Flex>
            <Flex direction={{ default: 'column' }}>
              {Object.values(reviewTemplate[key]).map((value, index) => (
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
