import { useCreateNewTemplate } from '../core/use-cases/createNewTemplate';
import { CreateTemplateDropdown } from './components/CreateTemplateDropdown';

type CreateTemplateFooterType = {
  onCancel: () => void;
};

export const CreateTemplateFooter = ({ onCancel }: CreateTemplateFooterType) => {
  const { createNewTemplate, isLoading } = useCreateNewTemplate();

  return <CreateTemplateDropdown isAdding={isLoading} onClose={onCancel} add={createNewTemplate} />;
};
