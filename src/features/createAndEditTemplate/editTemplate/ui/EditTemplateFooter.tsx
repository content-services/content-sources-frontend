import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  ButtonVariant,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { useConfirmEditTemplate } from '../core/use-cases/confirmEditTemplate';

type EditTemplateFooterProps = {
  cancelModal: () => void;
};

export const EditTemplateFooter = ({ cancelModal }: EditTemplateFooterProps) => {
  const { editTemplate, isLoading } = useConfirmEditTemplate();
  const { goToPrevStep } = useWizardContext();

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              ouiaId='wizard-back-btn'
              variant={ButtonVariant.secondary}
              onClick={goToPrevStep}
            >
              Back
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button
              ouiaId='wizard-edit-btn'
              variant={ButtonVariant.primary}
              onClick={() => editTemplate().then(cancelModal)}
              isDisabled={isLoading}
            >
              Confirm changes
            </Button>
          </ActionListItem>
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button ouiaId='wizard-cancel-btn' variant={ButtonVariant.link} onClick={cancelModal}>
              Cancel
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};
