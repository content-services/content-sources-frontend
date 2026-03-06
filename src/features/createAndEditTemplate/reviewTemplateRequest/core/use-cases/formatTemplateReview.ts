import { checkTemplateRequestIsFinalized } from 'features/createAndEditTemplate/shared/core/checkTemplateRequestIsFinalized';
import { useMemo } from 'react';
import { createTemplateReview } from '../domain/createTemplateReview';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { FormattedTemplateReview } from '../ports';

export const useFormatTemplateReview: FormattedTemplateReview = () => {
  const templateRequest = useTemplateRequestState();

  const templateReview = useMemo(() => {
    const { isFinalized, template } = checkTemplateRequestIsFinalized(templateRequest);

    if (!isFinalized) {
      throw new Error('Template Request has missing properties');
    }
    return createTemplateReview(template);
  }, [templateRequest]);

  return templateReview;
};
