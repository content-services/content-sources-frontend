import {
  Bullseye,
  Modal,
  ModalVariant,
  Spinner,
  Wizard,
  WizardHeader,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AddTemplateContextProvider, useAddTemplateContext } from '../store/AddTemplateContext';
import RedhatRepositoriesStep from '../../redhatRepositories/ui/RedhatRepositoriesStep';
import CustomRepositoriesStep from '../../otherRepositories/ui/CustomRepositoriesStep';

import DefineContentStep from '../../defineContent/ui/DefineContentStep';
import SetUpDateStep from '../../selectSnapshots/ui/SetUpDateStep';
import DetailStep from '../../describeTemplate/ui/DetailStep';
import ReviewStep from '../../reviewTemplateRequest/ui/ReviewStep';
import { isEmpty } from 'lodash';
import { createUseStyles } from 'react-jss';
import { useEffect, useRef } from 'react';
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

const AddOrEditTemplateBase = ({ modalProps, wizardHeaderProps, footer }: TemplateBaseProps) => {
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

  const onCancel = () => {
    if (fromRef.current === 'table') {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    } else if (isEdit && editUUID) {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}/${editUUID}`);
    } else {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    }
  };

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

// Wrap the modal with the provider
export function AddOrEditTemplate({ templateProps }: TemplateModalProps) {
  return (
    <AddTemplateContextProvider>
      <AddOrEditTemplateBase {...templateProps} />
    </AddTemplateContextProvider>
  );
}
