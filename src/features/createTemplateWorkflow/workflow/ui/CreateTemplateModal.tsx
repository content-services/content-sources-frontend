import { Modal, ModalVariant, Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';

import { useInitialStep } from '../core/chooseInitialStep';
import { useCheckIsDisabledStep } from '../core/enableStep';
import { useCancelModal } from '../core/cancelModal';

import { TemplateRequestStore } from '../store/TemplateRequestStore';
import { VersionsStore } from 'features/createTemplateWorkflow/repositoriesVersionDefinition/store/VersionsStore';
import { AdditionalRepositoriesStore } from 'features/createTemplateWorkflow/additionalRepositories/store/AdditionalRepositoriesStore';
import { OtherRepositoriesStore } from 'features/createTemplateWorkflow/otherRepositories/store/OtherRepositoriesStore';
import { SnapshotsStore } from 'features/createTemplateWorkflow/repositoriesSnapshots/store/SnapshotsStore';

import VersionDefinitions from 'features/createTemplateWorkflow/repositoriesVersionDefinition/ui/VersionsDefinitions';
import AdditionalRepositories from 'features/createTemplateWorkflow/additionalRepositories/ui/AdditionalRepositories';
import OtherRepositories from 'features/createTemplateWorkflow/otherRepositories/ui/OtherRepositories';
import RepositoriesSnapshots from 'features/createTemplateWorkflow/repositoriesSnapshots/ui/RepositoriesSnapshots';
import TemplateDescription from 'features/createTemplateWorkflow/describeTemplate/ui/TemplateDescription';
import ReviewTemplateRequest from 'features/createTemplateWorkflow/reviewTemplateRequest/ui/ReviewTemplateRequest';
import CreateTemplateButton from 'features/createTemplateWorkflow/createTemplate/ui/CreateTemplateButton';

const CreateTemplateBase = () => {
  const initialIndex = useInitialStep();
  const checkIsDisabledStep = useCheckIsDisabledStep();
  const cancelModal = useCancelModal();

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
            onClose={cancelModal}
            closeButtonAriaLabel='close_create_content_template'
          />
        }
        onClose={cancelModal}
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
          footer={<CreateTemplateButton onCancel={cancelModal} />}
        >
          <ReviewTemplateRequest />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default function CreateTemplateModal() {
  return (
    <TemplateRequestStore>
      <VersionsStore>
        <AdditionalRepositoriesStore>
          <OtherRepositoriesStore>
            <SnapshotsStore>
              <CreateTemplateBase />
            </SnapshotsStore>
          </OtherRepositoriesStore>
        </AdditionalRepositoriesStore>
      </VersionsStore>
    </TemplateRequestStore>
  );
}
