import { FormGroup, TextArea } from '@patternfly/react-core';
import CustomHelperText from 'components/CustomHelperText/CustomHelperText';
import { preventPageRerender } from './preventPageRerender';
import { useValidateDetail } from '../../core/use-cases/validateDetail';

export const TemplateDetail = () => {
  const { validateDetail, error, text, isValidated } = useValidateDetail();

  return (
    <FormGroup label='Template Detail' isRequired>
      <TextArea
        id='description'
        name='description'
        label='Description'
        data-ouia-component-id='input_description'
        type='text'
        validated={isValidated}
        onChange={(_, rawValue) => validateDetail(rawValue)}
        value={text}
        placeholder='Enter detail'
        onKeyDown={preventPageRerender}
      />
      <CustomHelperText hide={!error} textValue={error} />
    </FormGroup>
  );
};
