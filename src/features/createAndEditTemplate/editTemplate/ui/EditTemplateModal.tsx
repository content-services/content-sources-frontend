import { AddOrEditTemplate } from 'features/createAndEditTemplate/workflow/ui/AddOrEditTemplate';
import { EditTemplateFooter } from './EditTemplateFooter';

export default function EditTemplateModal() {
  const editWizardHeaderProps = {
    title: 'Edit content template',
    titleId: 'edit_content_template',
    'data-ouia-component-id': 'edit_content_template',
    description: 'Prepare for your next patching cycle with a content template.',
    descriptionId: 'edit-template-modal-wizard-description',
    closeButtonAriaLabel: 'close_edit_content_template',
  };

  const editModalProps = {
    ouiaId: 'edit_template_modal',
    'aria-label': 'edit template modal',
    'aria-describedby': 'edit-template-modal-wizard-description',
  };

  const editFooter = (cancelModal) => <EditTemplateFooter cancelModal={cancelModal} />;

  const props = {
    modalProps: editModalProps,
    wizardHeaderProps: editWizardHeaderProps,
    footer: editFooter,
  };

  return <AddOrEditTemplate templateProps={props} />;
}
