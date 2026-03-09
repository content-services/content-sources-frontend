import { WizardFooterWrapper } from '@patternfly/react-core';
import { CreateTemplateFooter } from './CreateTemplateFooter';
import { AddOrEditTemplate } from 'features/createAndEditTemplate/workflow/ui/AddOrEditTemplate';

export default function CreateTemplateModal() {
  const createWizardHeaderProps = {
    title: 'Create content template',
    titleId: 'create_content_template',
    'data-ouia-component-id': 'create_content_template',
    description: 'Prepare for your next patching cycle with a content template.',
    descriptionId: 'add-template-modal-wizard-description',
    closeButtonAriaLabel: 'close_create_content_template',
  };

  const createModalProps = {
    ouiaId: 'add_template_modal',
    'aria-label': 'add template modal',
    'aria-describedby': 'add-template-modal-wizard-description',
  };

  const createFooter = (cancelModal) => (
    <WizardFooterWrapper>
      <CreateTemplateFooter onCancel={cancelModal} />
    </WizardFooterWrapper>
  );

  const props = {
    modalProps: createModalProps,
    wizardHeaderProps: createWizardHeaderProps,
    footer: createFooter,
  };

  return <AddOrEditTemplate templateProps={props} />;
}
