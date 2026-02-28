import { useCallback } from 'react';

import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useEditTemplateState } from '../../store/EditTemplateStore';
import { useEditTemplateMutation } from '../../api/useEditTemplateMutation';
import { checkTemplateRequestIsFinalized } from 'features/createAndEditTemplate/shared/core/checkTemplateRequestIsFinalized';
import { editTemplateToSend } from '../domain/editTemplateToSend';
import { ConfirmEditTemplate } from '../ports';

export const useConfirmEditTemplate = () => {
  const templateRequest = useTemplateRequestState();
  const { uuid } = useEditTemplateState();
  const { mutateAsync, isLoading } = useEditTemplateMutation();

  const editTemplate: ConfirmEditTemplate = useCallback(async () => {
    const { isFinalized, template } = checkTemplateRequestIsFinalized(templateRequest);
    if (!isFinalized) {
      throw new Error('Template Request has missing properties');
    }
    const templateWithUUID = { ...template, uuid };
    const templateToSend = editTemplateToSend(templateWithUUID);
    return await mutateAsync(templateToSend);
  }, [templateRequest, uuid]);

  return { editTemplate, isLoading };
};
