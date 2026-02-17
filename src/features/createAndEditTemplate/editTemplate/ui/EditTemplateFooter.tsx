import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  ButtonVariant,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useEditTemplateQuery } from 'services/Templates/TemplateQueries';
import { useEditTemplateState } from '../store/EditTemplateStore';
import { useQueryClient } from 'react-query';
import { editTemplateToSend } from '../core/editTemplateToSend';
import { useMemo } from 'react';
import { checkTemplateRequestIsFinalized } from 'features/createAndEditTemplate/shared/core/checkTemplateRequestIsFinalized';

type EditTemplateFooterProps = {
  cancelModal: () => void;
};

export const EditTemplateFooter = ({ cancelModal }: EditTemplateFooterProps) => {
  const templateRequest = useTemplateRequestState();
  const { uuid } = useEditTemplateState();

  const queryClient = useQueryClient();

  const templateRequestToSend = useMemo(() => {
    const { isFinalized, template } = checkTemplateRequestIsFinalized(templateRequest);
    if (!isFinalized) {
      throw new Error('Template Request has missing properties');
    }
    const templateWithUUID = { ...template, uuid };
    return editTemplateToSend(templateWithUUID);
  }, [templateRequest, uuid]);

  const { mutateAsync: editTemplate, isLoading } = useEditTemplateQuery(
    queryClient,
    templateRequestToSend,
  );

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
