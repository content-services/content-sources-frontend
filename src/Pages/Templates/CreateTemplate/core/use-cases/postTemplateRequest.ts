import { useTemplateRequestState } from '../../store/TemplateRequestStore';
import { useCreateTemplateMutation } from '../../api/useCreateTemplateMutation';
import { createTemplate } from '../domain/createTemplate';
import { useCallback } from 'react';
import { PostTemplateRequest } from '../ports.input';

export const usePostTemplateRequest = () => {
  const templateRequest = useTemplateRequestState();
  const { mutateAsync, isLoading } = useCreateTemplateMutation();

  const postTemplateRequest: PostTemplateRequest = useCallback(async () => {
    const templateToSend = createTemplate(templateRequest);
    return await mutateAsync(templateToSend);
  }, [templateRequest]);

  return { postTemplateRequest, isLoading };
};
