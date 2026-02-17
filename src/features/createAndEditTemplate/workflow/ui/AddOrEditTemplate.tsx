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
import { useTemplateRequestDerivedState, TemplateStore } from '../store/TemplateStore';
import RedhatRepositoriesStep from 'features/createAndEditTemplate/redhatRepositories/ui/RedhatRepositoriesStep';
import CustomRepositoriesStep from 'features/createAndEditTemplate/otherRepositories/ui/CustomRepositoriesStep';
import DefineContentStep from 'features/createAndEditTemplate/defineContent/ui/DefineContentStep';
import SetUpDateStep from 'features/createAndEditTemplate/selectSnapshots/ui/SetUpDateStep';
import DetailStep from 'features/createAndEditTemplate/describeTemplate/ui/DetailStep';
import ReviewStep from 'features/createAndEditTemplate/reviewTemplateRequest/ui/ReviewStep';
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
  const { checkIsDisabledStep } = useCheckIsDisabledStep();

  const { isEmptyTemplateRequest } = useTemplateRequestDerivedState();
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
      onClose={isEmptyTemplateRequest && isEditTemplate ? onCancel : undefined}
      disableFocusTrap
    >
      {isEmptyTemplateRequest && isEditTemplate ? (
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
                footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(2) }}
              >
                <DefineContentStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIsDisabledStep(2)}
                name='Red Hat repositories'
                id='redhat-repositories'
                key='redhat-repositories-key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(3) }}
              >
                <RedhatRepositoriesStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIsDisabledStep(3)}
                name='Other repositories'
                id='custom-repositories'
                key='custom-repositories-key'
                footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(4) }}
              >
                <CustomRepositoriesStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name='Set up date'
            id='set-up-date'
            isDisabled={checkIsDisabledStep(4)}
            footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(5) }}
          >
            <SetUpDateStep />
          </WizardStep>
          <WizardStep
            isDisabled={checkIsDisabledStep(5)}
            footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(6) }}
            name='Detail'
            id='detail'
          >
            <DetailStep />
          </WizardStep>
          <WizardStep
            isDisabled={checkIsDisabledStep(6)}
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
    <TemplateStore>
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
    </TemplateStore>
  );
}
