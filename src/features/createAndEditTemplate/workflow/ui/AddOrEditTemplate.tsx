import {
  Bullseye,
  Modal,
  ModalVariant,
  Spinner,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';
import { AddTemplateContextProvider, useAddTemplateContext } from '../store/AddTemplateContext';
import RedhatRepositoriesStep from 'features/createAndEditTemplate/redhatRepositories/ui/RedhatRepositoriesStep';
import CustomRepositoriesStep from 'features/createAndEditTemplate/otherRepositories/ui/CustomRepositoriesStep';
import DefineContentStep from 'features/createAndEditTemplate/defineContent/ui/DefineContentStep';
import SetUpDateStep from 'features/createAndEditTemplate/selectSnapshots/ui/SetUpDateStep';
import DetailStep from 'features/createAndEditTemplate/describeTemplate/ui/DetailStep';
import ReviewStep from 'features/createAndEditTemplate/reviewTemplateRequest/ui/ReviewStep';
import { isEmpty } from 'lodash';
import { createUseStyles } from 'react-jss';
import { useOnCancelModal } from '../core/cancelModal';
import { useInitialStep, WizardUrlSync } from '../core/chooseStep';
import { DefineContentStore } from 'features/createAndEditTemplate/defineContent/store/DefineContentStore';
import { RedhatRepositoriesStore } from 'features/createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore';
import { CustomRepositoriesStore } from 'features/createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore';
import { SetUpDateStore } from 'features/createAndEditTemplate/selectSnapshots/store/SetUpDateStore';
import { ReviewTemplateStore } from 'features/createAndEditTemplate/reviewTemplateRequest/store/ReviewTemplateStore';
import {
  EditTemplateStore,
  useEditTemplateState,
} from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';
import { useCheckIsDisabledStep } from '../core/enableStep';

const useStyles = createUseStyles({
  minHeightForSpinner: {
    minHeight: '60vh',
  },
});

export interface Props {
  isDisabled: boolean;
  addRepo: (snapshot: boolean) => void;
}

type TemplateBaseProps = {
  modalProps: {
    ouiaId: string;
    'aria-label': string;
    'aria-describedby': string;
  };
  wizardHeaderProps: {
    title: string;
    titleId: string;
    'data-ouia-component-id': string;
    description: string;
    descriptionId: string;
    closeButtonAriaLabel: string;
  };
  footer: (cancelModal: () => void) => React.JSX.Element;
};

const TemplateModalBase = ({ modalProps, wizardHeaderProps, footer }: TemplateBaseProps) => {
  const classes = useStyles();
  const [, setUrlSearchParams] = useSearchParams();

  const initialIndex = useInitialStep();
  const onCancel = useOnCancelModal();

  const { templateRequest } = useAddTemplateContext();
  const { checkIfCurrentStepValid } = useCheckIsDisabledStep();
  const { isEditTemplate } = useEditTemplateState();

  const sharedFooterProps = {
    nextButtonProps: { ouiaId: 'wizard-next-btn' },
    backButtonProps: { ouiaId: 'wizard-back-btn' },
    cancelButtonProps: { ouiaId: 'wizard-cancel-btn' },
  };

  return (
    <Modal
      {...modalProps}
      variant={ModalVariant.large}
      isOpen
      onClose={isEditTemplate && isEmpty(templateRequest) ? onCancel : undefined}
      disableFocusTrap
    >
      {isEditTemplate && isEmpty(templateRequest) ? (
        <Bullseye className={classes.minHeightForSpinner}>
          <Spinner size='xl' />
        </Bullseye>
      ) : (
        <Wizard
          header={
            <>
              <WizardUrlSync onCancel={onCancel} />
              <WizardHeader {...wizardHeaderProps} onClose={onCancel} />
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
            footer={footer(onCancel)}
          >
            <ReviewStep />
          </WizardStep>
        </Wizard>
      )}
    </Modal>
  );
};

type TemplateModalProps = {
  templateProps: TemplateBaseProps;
};

export function AddOrEditTemplate({ templateProps }: TemplateModalProps) {
  return (
    <AddTemplateContextProvider>
      <EditTemplateStore>
        <DefineContentStore>
          <RedhatRepositoriesStore>
            <CustomRepositoriesStore>
              <SetUpDateStore>
                <ReviewTemplateStore>
                  <TemplateModalBase {...templateProps} />
                </ReviewTemplateStore>
              </SetUpDateStore>
            </CustomRepositoriesStore>
          </RedhatRepositoriesStore>
        </DefineContentStore>
      </EditTemplateStore>
    </AddTemplateContextProvider>
  );
}
