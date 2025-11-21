import { useNavigate } from 'react-router-dom';

import { Modal, ModalVariant, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import { TEMPLATES_ROUTE } from 'Routes/constants';
import useRootPath from 'Hooks/useRootPath';

import VersionDefinitions from '../steps/VersionsDefinition/ui/VersionsDefinitions';
import AdditionalRepositories from '../steps/AdditionalRepositories/ui/AdditionalRepositories';
import OtherRepositories from '../steps/OtherRepositories/ui/OtherRepositories';
import RepositoriesSnapshots from '../steps/RepositoriesSnapshots/ui/RepositoriesSnapshots';
import TemplateDescription from '../steps/TemplateDescription/ui/TemplateDescription';
import ReviewTemplateRequest from '../steps/ReviewTemplate/ui/ReviewTemplateRequest';
import { CreateTemplateButton } from './CreateTemplateButton';

import { TemplateRequestStore } from '../store/TemplateRequestStore';
import { VersionsStore } from '../steps/VersionsDefinition/store/VersionsStore';
import { AdditionalRepositoriesStore } from '../steps/AdditionalRepositories/store/AdditionalRepositoriesStore';
import { OtherRepositoriesStore } from '../steps/OtherRepositories/store/OtherRepositoriesStore';
import { SnapshotsStore } from '../steps/RepositoriesSnapshots/store/SnapshotsStore';
import { ReviewTemplateStore } from '../steps/ReviewTemplate/store/ReviewTemplateStore';
import { useCheckIsDisabledStep } from '../core/use-cases/checkIfStepIsEnabled';
import { useInitialIndex } from '../core/use-cases/initialIndex';

const CreateTemplateBase = () => {
  const rootPath = useRootPath();
  const navigate = useNavigate();

  const initialIndex = useInitialIndex();
  const checkIsDisabledStep = useCheckIsDisabledStep();

  const onCancel = () => navigate(`${rootPath}/${TEMPLATES_ROUTE}`);

  const sharedFooterProps = {
    nextButtonProps: { ouiaId: 'wizard-next-btn' },
    backButtonProps: { ouiaId: 'wizard-back-btn' },
    cancelButtonProps: { ouiaId: 'wizard-cancel-btn' },
  };

  return (
    <Modal
      ouiaId='add_template_modal'
      aria-label='add template modal'
      aria-describedby='edit-add-template-modal-wizard-description'
      variant={ModalVariant.large}
      isOpen
      disableFocusTrap
    >
      <Wizard
        header={
          <WizardHeader
            title='Create content template'
            titleId='create_content_template'
            data-ouia-component-id='create_content_template'
            description='Prepare for your next patching cycle with a content template.'
            descriptionId='edit-add-template-modal-wizard-description'
            onClose={onCancel}
            closeButtonAriaLabel='close_create_content_template'
          />
        }
        onClose={onCancel}
        startIndex={initialIndex}
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
              footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(2) }}
            >
              <VersionDefinitions />
            </WizardStep>,
            <WizardStep
              isDisabled={checkIsDisabledStep(2)}
              name='Red Hat repositories'
              id='redhat_repositories'
              key='redhat_repositories_key'
              footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(3) }}
            >
              <AdditionalRepositories />
            </WizardStep>,
            <WizardStep
              isDisabled={checkIsDisabledStep(3)}
              name='Other repositories'
              id='custom_repositories'
              key='custom_repositories_key'
              footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(4) }}
            >
              <OtherRepositories />
            </WizardStep>,
          ]}
        />
        <WizardStep
          name='Set up date'
          id='set_up_date_step'
          isDisabled={checkIsDisabledStep(4)}
          footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(5) }}
        >
          <RepositoriesSnapshots />
        </WizardStep>
        <WizardStep
          isDisabled={checkIsDisabledStep(5)}
          footer={{ ...sharedFooterProps, isNextDisabled: checkIsDisabledStep(6) }}
          name='Detail'
          id='detail_step'
        >
          <TemplateDescription />
        </WizardStep>
        <WizardStep
          isDisabled={checkIsDisabledStep(6)}
          name='Review'
          id='review_step'
          footer={<CreateTemplateButton onCancel={onCancel} />}
        >
          <ReviewTemplateRequest />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export function CreateTemplateModal() {
  return (
    <TemplateRequestStore>
      <VersionsStore>
        <AdditionalRepositoriesStore>
          <OtherRepositoriesStore>
            <SnapshotsStore>
              <ReviewTemplateStore>
                <CreateTemplateBase />
              </ReviewTemplateStore>
            </SnapshotsStore>
          </OtherRepositoriesStore>
        </AdditionalRepositoriesStore>
      </VersionsStore>
    </TemplateRequestStore>
  );
}
