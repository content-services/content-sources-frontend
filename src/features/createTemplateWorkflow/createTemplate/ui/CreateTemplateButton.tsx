import { usePostTemplateRequest } from '../core/use-cases/postTemplateRequest';
import { AddNavigateButton } from './AddNavigateButton';

type CreateTemplateButtonType = {
  onCancel: () => void;
};

const CreateTemplateButton = ({ onCancel }: CreateTemplateButtonType) => {
  const { postTemplateRequest, isLoading } = usePostTemplateRequest();

  return <AddNavigateButton isAdding={isLoading} onClose={onCancel} add={postTemplateRequest} />;
};

export default CreateTemplateButton;
