import {
  Bullseye,
  Modal,
  ModalVariant,
  Spinner,
  Wizard,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';

import useRootPath from 'Hooks/useRootPath';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TEMPLATES_ROUTE } from 'Routes/constants';
import { useCreateTemplateQuery, useEditTemplateQuery } from 'services/Templates/TemplateQueries';
import { AddTemplateContextProvider, useAddTemplateContext } from './AddTemplateContext';
import RedhatRepositoriesStep from './steps/RedhatRepositoriesStep';
import CustomRepositoriesStep from './steps/CustomRepositoriesStep';
import { TemplateRequest } from 'services/Templates/TemplateApi';

import DefineContentStep from './steps/DefineContentStep';
import SetUpDateStep from './steps/SetUpDateStep';
import DetailStep from './steps/DetailStep';
import ReviewStep from './steps/ReviewStep';
import { formatTemplateDate } from 'helpers';
import { isEmpty } from 'lodash';
import { createUseStyles } from 'react-jss';
import { useMemo } from 'react';
import { AddNavigateButton } from './AddNavigateButton';

const useStyles = createUseStyles({
  minHeightForSpinner: {
    minHeight: '60vh',
  },
});

export interface Props {
  isDisabled: boolean;
  addRepo: (snapshot: boolean) => void;
}

const indexMapper = {
  define_content: 2,
  redhat_repositories: 3,
  custom_repositories: 4,
  set_up_date_step: 5,
  detail_step: 6,
  review_step: 7,
};

const AddTemplateBase = () => {
  const rootPath = useRootPath();
  const classes = useStyles();
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const { isEdit, templateRequest, checkIfCurrentStepValid, editUUID } = useAddTemplateContext();

  const initialIndex = useMemo(() => {
    const tabValue = urlSearchParams.get('tab');
    if (isEdit && tabValue && indexMapper[tabValue]) return indexMapper[tabValue];
    return 2;
  }, []);

  const { queryClient } = useAddTemplateContext();
  const onClose = () => navigate(`${rootPath}/${TEMPLATES_ROUTE}`);

  const { mutateAsync: addTemplate, isLoading: isAdding } = useCreateTemplateQuery(queryClient, {
    ...(templateRequest as TemplateRequest),
    date: templateRequest.use_latest ? null : formatTemplateDate(templateRequest.date || ''),
  });

  const { mutateAsync: editTemplate, isLoading: isEditing } = useEditTemplateQuery(queryClient, {
    uuid: editUUID as string,
    ...(templateRequest as TemplateRequest),
    date: templateRequest.use_latest ? null : formatTemplateDate(templateRequest.date || ''),
  });

  const sharedFooterProps = {
    nextButtonProps: { ouiaId: 'wizard-next-btn' },
    backButtonProps: { ouiaId: 'wizard-back-btn' },
    cancelButtonProps: { ouiaId: 'wizard-cancel-btn' },
  };

  return (
    <Modal
      ouiaId={`${isEdit ? 'edit' : 'add'}_template_modal`}
      aria-label={`${isEdit ? 'edit' : 'add'} template modal`}
      variant={ModalVariant.large}
      showClose={isEdit && isEmpty(templateRequest)}
      isOpen
      onClose={onClose}
      hasNoBodyWrapper
      disableFocusTrap
    >
      {isEdit && isEmpty(templateRequest) ? (
        <Bullseye className={classes.minHeightForSpinner}>
          <Spinner size='xl' />
        </Bullseye>
      ) : (
        <Wizard
          header={
            <WizardHeader
              title={`${isEdit ? 'Edit' : 'Create'} content template`}
              titleId={`${isEdit ? 'edit' : 'create'}_content_template`}
              description='Prepare for your next patching cycle with a content template.'
              onClose={onClose}
              closeButtonAriaLabel={`close_${isEdit ? 'edit' : 'create'}_content_template`}
            />
          }
          onClose={onClose}
          startIndex={initialIndex}
          onStepChange={
            isEdit
              ? (_, currentStep) => {
                  setUrlSearchParams((prev) => ({ ...prev, tab: currentStep.id }));
                }
              : undefined
          }
        >
          <WizardStep
            name='Content'
            id='content_step'
            isExpandable
            steps={[
              <WizardStep
                name='Define content'
                id='define_content'
                key='define_content_key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(1) }}
              >
                <DefineContentStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIfCurrentStepValid(1)}
                name='Red Hat repositories'
                id='redhat_repositories'
                key='redhat_repositories_key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(2) }}
              >
                <RedhatRepositoriesStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIfCurrentStepValid(2)}
                name='Custom Repositories'
                id='custom_repositories'
                key='custom_repositories_key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(3) }}
              >
                <CustomRepositoriesStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name='Set snapshot date'
            id='set_up_date_step'
            isDisabled={checkIfCurrentStepValid(3)}
            footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(4) }}
          >
            <SetUpDateStep />
          </WizardStep>
          {/* <WizardStep name='Systems (optional)' id='systems' /> */}
          <WizardStep
            isDisabled={checkIfCurrentStepValid(4)}
            footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(5) }}
            name='Detail'
            id='detail_step'
          >
            <DetailStep />
          </WizardStep>
          <WizardStep
            isDisabled={checkIfCurrentStepValid(5)}
            name='Review'
            id='review_step'
            footer={
              isEdit ? (
                {
                  ...sharedFooterProps,
                  nextButtonProps: { ouiaId: 'wizard-edit-btn' },
                  nextButtonText: 'Confirm changes',
                  onNext: () => editTemplate().then(() => onClose()),
                  isNextDisabled: isEditing,
                }
              ) : (
                <WizardFooterWrapper>
                  <AddNavigateButton isAdding={isAdding} onClose={onClose} add={addTemplate} />
                </WizardFooterWrapper>
              )
            }
          >
            <ReviewStep />
          </WizardStep>
        </Wizard>
      )}
    </Modal>
  );
};

// Wrap the modal with the provider
export function AddTemplate() {
  return (
    <AddTemplateContextProvider>
      <AddTemplateBase />
    </AddTemplateContextProvider>
  );
}
