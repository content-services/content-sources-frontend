import { Form, FormGroup, TextArea, TextInput } from '@patternfly/react-core';
import CustomHelperText from 'components/CustomHelperText/CustomHelperText';
import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { useState } from 'react';
import { TemplateValidationSchema } from '../../core/helpers';

export const DetailInputFields = () => {
  const { templateRequest, setTemplateRequest } = useAddTemplateContext();
  const [errors, setErrors] = useState({ name: '', description: '' });

  const setFieldValues = (value: string, field: 'name' | 'description') => {
    setTemplateRequest((prev) => ({ ...prev, [field]: value }));
    try {
      TemplateValidationSchema.validateSyncAt(field, { [field]: value });
      if (errors[field]) setErrors({ ...errors, [field]: '' });
    } catch (err) {
      const message = (err as Error).message;
      setErrors({ ...errors, [field]: message });
    }
  };
  return (
    <Form>
      <FormGroup label='Name' isRequired>
        <TextInput
          isRequired
          id='name'
          name='name'
          label='Name'
          ouiaId='input_name'
          type='text'
          validated={errors.name ? 'error' : 'default'}
          onChange={(_event, value) => setFieldValues(value, 'name')}
          value={templateRequest?.name || ''}
          placeholder='Enter name'
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
        />
        <CustomHelperText hide={!errors.name} textValue={errors.name} />
      </FormGroup>
      <FormGroup label='Description'>
        <TextArea
          id='description'
          name='description'
          label='Description'
          data-ouia-component-id='input_description'
          type='text'
          validated={errors.description ? 'error' : 'default'}
          onChange={(_event, value) => setFieldValues(value, 'description')}
          value={templateRequest?.description || ''}
          placeholder='Enter description'
        />
        <CustomHelperText hide={!errors.description} textValue={errors.description} />
      </FormGroup>
    </Form>
  );
};
