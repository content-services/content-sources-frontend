import { useCallback } from 'react';

import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useCreateTemplateMutation } from '../../api/useCreateTemplateMutation';

import { checkTemplateRequestIsFinalized } from 'features/createAndEditTemplate/shared/core/checkTemplateRequestIsFinalized';

import { createTemplateRequest } from '../domain/createTemplateRequest';
import { CreateNewTemplate } from '../ports';

export const useCreateNewTemplate = () => {
  const templateRequest = useTemplateRequestState();
  const { mutateAsync, isLoading } = useCreateTemplateMutation();

  const createNewTemplate: CreateNewTemplate = useCallback(async () => {
    const { isFinalized, template } = checkTemplateRequestIsFinalized(templateRequest);
    if (!isFinalized) {
      throw new Error('Template Request has missing properties');
    }
    const templateToSend = createTemplateRequest(template);
    return await mutateAsync(templateToSend);
  }, [templateRequest]);

  return { createNewTemplate, isLoading };
};
