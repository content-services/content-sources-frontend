import { FormGroup, TextInput } from '@patternfly/react-core';

import CustomHelperText from 'components/CustomHelperText/CustomHelperText';

import { useValidateTitle } from '../../core/use-cases/validateTitle';

export const TemplateTitle = () => {
  const { validateTitle, isValidated, error, text } = useValidateTitle();

  return (
    <FormGroup label='Template Title' isRequired>
      <TextInput
        isRequired
        id='name'
        name='name'
        label='Name'
        ouiaId='input_name'
        type='text'
        validated={isValidated}
        onChange={(_, rawValue) => validateTitle(rawValue)}
        value={text}
        placeholder='Enter title'
        onKeyDown={preventDefault}
      />
      <CustomHelperText hide={!error} textValue={error} />
    </FormGroup>
  );
};

const preventDefault = () => (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
