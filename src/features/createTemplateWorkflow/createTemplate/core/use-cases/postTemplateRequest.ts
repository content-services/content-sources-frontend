import { useCallback } from 'react';

import { createTemplateRequest } from '../domain/createTemplateRequest';

import { useTemplateRequestState } from '../../../workflow/store/TemplateRequestStore';
import { useCreateTemplateMutation } from '../../api/useCreateTemplateMutation';

import { PostTemplateRequest } from '../ports.input';
import { checkTemplateRequestIsFinalized } from '../../../shared/domain/checkTemplateRequestIsFinalized';

export const usePostTemplateRequest = () => {
  // read template request state
  const templateRequest = useTemplateRequestState();
  const { mutateAsync, isLoading } = useCreateTemplateMutation();

  const postTemplateRequest: PostTemplateRequest = useCallback(async () => {
    const { isFinalized, template } = checkTemplateRequestIsFinalized(templateRequest);
    if (!isFinalized) {
      throw new Error('Template Request has missing properties');
    }
    const templateToSend = createTemplateRequest(template);
    return await mutateAsync(templateToSend);
  }, [templateRequest]);

  return { postTemplateRequest, isLoading };
};
