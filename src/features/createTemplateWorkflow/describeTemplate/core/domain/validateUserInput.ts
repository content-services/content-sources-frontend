import * as Yup from 'yup';

const TemplateDescriptionValidation = Yup.object().shape({
  title: Yup.string().max(100, 'Too Long!').required('Required'),
  detail: Yup.string().max(255, 'Too Long!'),
});

export function validateUserInput(field, value) {
  try {
    TemplateDescriptionValidation.validateSyncAt(field, { [field]: value });
    return { data: value, error: null };
  } catch (err) {
    const error = (err as Error).message;
    return { data: null, error };
  }
}
