import { Content, ExpandableSection, Flex } from '@patternfly/react-core';
import { useFormatTemplateReview } from '../../core/use-cases/formatTemplateReview';
import { TemplateReviewKey } from '../../core/types';

export const ReviewTemplateContent = () => {
  const templateReview = useFormatTemplateReview();

  return (
    <>
      {(Object.keys(templateReview) as TemplateReviewKey[]).map((key, index) => (
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
