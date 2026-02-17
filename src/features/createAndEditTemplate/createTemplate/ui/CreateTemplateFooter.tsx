import { useCreateTemplateQuery } from 'services/Templates/TemplateQueries';
import { AddNavigateButton } from './AddNavigateButton';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useQueryClient } from 'react-query';
import { createTemplateRequest } from '../core/createTemplateRequest';
import { checkTemplateRequestIsFinalized } from 'features/createAndEditTemplate/shared/core/checkTemplateRequestIsFinalized';
import { useMemo } from 'react';

type CreateTemplateFooterType = {
  onCancel: () => void;
};

export const CreateTemplateFooter = ({ onCancel }: CreateTemplateFooterType) => {
  const templateRequest = useTemplateRequestState();

  const queryClient = useQueryClient();

  const templateRequestToSend = useMemo(() => {
    const { isFinalized, template } = checkTemplateRequestIsFinalized(templateRequest);
    if (!isFinalized) {
      throw new Error('Template Request has missing properties');
    }
    return createTemplateRequest(template);
  }, [templateRequest]);

  const { mutateAsync: addTemplate, isLoading: isAdding } = useCreateTemplateQuery(
    queryClient,
    templateRequestToSend,
  );

  return <AddNavigateButton isAdding={isAdding} onClose={onCancel} add={addTemplate} />;
};
