import { useTemplateRequestState } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { createTemplateReview } from '../domain/createTemplateReview';
import { useMemo } from 'react';
import { checkTemplateRequestIsFinalized } from 'features/createTemplateWorkflow/shared/domain/checkTemplateRequestIsFinalized';
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
