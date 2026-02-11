import { useCreateTemplateQuery } from 'services/Templates/TemplateQueries';
import { AddNavigateButton } from './AddNavigateButton';
import { TemplateRequest } from 'services/Templates/TemplateApi';
import { formatTemplateDate } from 'helpers';
import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { useQueryClient } from 'react-query';

type CreateTemplateFooterType = {
  onCancel: () => void;
};

export const CreateTemplateFooter = ({ onCancel }: CreateTemplateFooterType) => {
  const { templateRequest } = useAddTemplateContext();
  const queryClient = useQueryClient();

  const { mutateAsync: addTemplate, isLoading: isAdding } = useCreateTemplateQuery(queryClient, {
    ...(templateRequest as TemplateRequest),
    date: templateRequest.use_latest ? null : formatTemplateDate(templateRequest.date || ''),
  });

  return <AddNavigateButton isAdding={isAdding} onClose={onCancel} add={addTemplate} />;
};
