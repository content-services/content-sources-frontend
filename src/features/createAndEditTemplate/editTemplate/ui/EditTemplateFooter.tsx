import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  ButtonVariant,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { formatTemplateDate } from 'helpers';
import { TemplateRequest } from 'services/Templates/TemplateApi';
import { useEditTemplateQuery } from 'services/Templates/TemplateQueries';
import { useEditTemplateState } from '../store/EditTemplateStore';
import { useQueryClient } from 'react-query';

type EditTemplateFooterProps = {
  cancelModal: () => void;
};

export const EditTemplateFooter = ({ cancelModal }: EditTemplateFooterProps) => {
  const { templateRequest } = useAddTemplateContext();
  const { uuid } = useEditTemplateState();
  const queryClient = useQueryClient();

  const { mutateAsync: editTemplate, isLoading } = useEditTemplateQuery(queryClient, {
    uuid,
    ...(templateRequest as TemplateRequest),
    date: templateRequest.use_latest ? null : formatTemplateDate(templateRequest.date || ''),
  });

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
