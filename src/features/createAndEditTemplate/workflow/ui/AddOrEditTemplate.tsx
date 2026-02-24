import {
  Bullseye,
  Modal,
  ModalVariant,
  Spinner,
  Wizard,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useCreateTemplateQuery, useEditTemplateQuery } from 'services/Templates/TemplateQueries';
import { AddTemplateContextProvider, useAddTemplateContext } from '../store/AddTemplateContext';
import RedhatRepositoriesStep from '../../redhatRepositories/ui/RedhatRepositoriesStep';
import CustomRepositoriesStep from '../../otherRepositories/ui/CustomRepositoriesStep';
import { TemplateRequest } from 'services/Templates/TemplateApi';

import DefineContentStep from '../../defineContent/ui/DefineContentStep';
import SetUpDateStep from '../../selectSnapshots/ui/SetUpDateStep';
import DetailStep from '../../describeTemplate/ui/DetailStep';
import ReviewStep from '../../reviewTemplateRequest/ui/ReviewStep';
import { formatTemplateDate } from 'helpers';
import { isEmpty } from 'lodash';
import { createUseStyles } from 'react-jss';
import { useEffect, useRef } from 'react';
import { AddNavigateButton } from '../../createTemplate/ui/AddNavigateButton';
import useRootPath from 'Hooks/useRootPath';
import { TEMPLATES_ROUTE } from 'Routes/constants';

const useStyles = createUseStyles({
  minHeightForSpinner: {
    minHeight: '60vh',
  },
});

export interface Props {
  isDisabled: boolean;
  addRepo: (snapshot: boolean) => void;
}

const DEFAULT_STEP_ID = 'define-content';

const stepIdToIndex: Record<string, number> = {
  'define-content': 2,
  'redhat-repositories': 3,
  'custom-repositories': 4,
  'set-up-date': 5,
  detail: 6,
  review: 7,
};

// Component to sync URL with wizard state (must be inside Wizard)
const WizardUrlSync = ({ onCancel }: { onCancel: () => void }) => {
  const { goToStepById, activeStep } = useWizardContext();
  const [urlSearchParams] = useSearchParams();

  const tabParam = urlSearchParams.get('tab');

  useEffect(() => {
    if (tabParam && tabParam !== activeStep?.id) {
      if (stepIdToIndex[tabParam]) {
        goToStepById(tabParam);
      } else if (tabParam === 'content') {
        goToStepById(DEFAULT_STEP_ID);
      } else {
        onCancel();
      }
    }
  }, [tabParam, activeStep?.id, goToStepById, onCancel]);

  return null;
};

const AddOrEditTemplateBase = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const rootPath = useRootPath();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  // Store the original 'from' value on mount (before step navigation changes location.state)
  const fromRef = useRef(location.state?.from);

  const { isEdit, templateRequest, checkIfCurrentStepValid, editUUID } = useAddTemplateContext();

  // useSafeUUIDParam in AddTemplateContext already validates the UUID
  // If in edit mode and UUID is invalid, it will be an empty string
  if (isEdit && !editUUID) throw new Error('UUID is invalid');

  const tabParam = urlSearchParams.get('tab');
  const initialIndex = tabParam && stepIdToIndex[tabParam] ? stepIdToIndex[tabParam] : 2;

  useEffect(() => {
    if (!urlSearchParams.get('tab')) {
      setUrlSearchParams({ tab: DEFAULT_STEP_ID }, { replace: true });
    }
  }, []);

  const { queryClient } = useAddTemplateContext();

  const onCancel = () => {
    if (fromRef.current === 'table') {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    } else if (isEdit && editUUID) {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}/${editUUID}`);
    } else {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    }
  };

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
      aria-describedby='edit-add-template-modal-wizard-description'
      variant={ModalVariant.large}
      isOpen
      onClose={isEdit && isEmpty(templateRequest) ? onCancel : undefined}
      disableFocusTrap
    >
      {isEdit && isEmpty(templateRequest) ? (
        <Bullseye className={classes.minHeightForSpinner}>
          <Spinner size='xl' />
        </Bullseye>
      ) : (
        <Wizard
          header={
            <>
              <WizardUrlSync onCancel={onCancel} />
              <WizardHeader
                title={`${isEdit ? 'Edit' : 'Create'} content template`}
                titleId={`${isEdit ? 'edit' : 'create'}_content_template`}
                data-ouia-component-id={`${isEdit ? 'edit' : 'create'}_content_template`}
                description='Prepare for your next patching cycle with a content template.'
                descriptionId='edit-add-template-modal-wizard-description'
                onClose={onCancel}
                closeButtonAriaLabel={`close_${isEdit ? 'edit' : 'create'}_content_template`}
              />
            </>
          }
          onClose={onCancel}
          startIndex={initialIndex}
          onStepChange={(_, currentStep) => {
            setUrlSearchParams({ tab: String(currentStep.id) });
          }}
        >
          <WizardStep
            name='Content'
            id='content'
            isExpandable
            steps={[
              <WizardStep
                name='Define content'
                id='define-content'
                key='define-content-key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(1) }}
              >
                <DefineContentStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIfCurrentStepValid(1)}
                name='Red Hat repositories'
                id='redhat-repositories'
                key='redhat-repositories-key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(2) }}
              >
                <RedhatRepositoriesStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIfCurrentStepValid(2)}
                name='Other repositories'
                id='custom-repositories'
                key='custom-repositories-key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIfCurrentStepValid(3) }}
              >
                <CustomRepositoriesStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name='Set up date'
            id='set-up-date'
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
            id='detail'
          >
            <DetailStep />
          </WizardStep>
          <WizardStep
            isDisabled={checkIfCurrentStepValid(5)}
            name='Review'
            id='review'
            footer={
              isEdit ? (
                {
                  ...sharedFooterProps,
                  nextButtonProps: { ouiaId: 'wizard-edit-btn' },
                  nextButtonText: 'Confirm changes',
                  onNext: () => editTemplate().then(() => onCancel()),
                  isNextDisabled: isEditing,
                }
              ) : (
                <WizardFooterWrapper>
                  <AddNavigateButton isAdding={isAdding} onClose={onCancel} add={addTemplate} />
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
export function AddOrEditTemplate() {
  return (
    <AddTemplateContextProvider>
      <AddOrEditTemplateBase />
    </AddTemplateContextProvider>
  );
}
