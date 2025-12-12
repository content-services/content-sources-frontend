import { render } from '@testing-library/react';
import { defaultTemplateItem } from 'testingHelpers';
import TemplateDescription from './TemplateDescription';

import { useValidateTitle } from '../core/use-cases/validateTitle';
import { useValidateDetail } from '../core/use-cases/validateDetail';

jest.mock(
  '@src/features/createTemplateWorkflow/describeTemplate/core/use-cases/validateDetail',
  () => ({
    useValidateDetail: jest.fn(),
  }),
);

jest.mock(
  '@src/features/createTemplateWorkflow/describeTemplate/core/use-cases/validateTitle',
  () => ({
    useValidateTitle: jest.fn(),
  }),
);

it('expect DetailStep to render correctly', () => {
  const mockTitle = {
    validateTitle: () => {},
    isValidated: true,
    error: '',
    text: defaultTemplateItem.name,
  };

  const mockDetail = {
    validateTitle: () => {},
    isValidated: true,
    error: '',
    text: defaultTemplateItem.description,
  };

  (useValidateTitle as jest.Mock).mockImplementation(() => mockTitle);
  (useValidateDetail as jest.Mock).mockImplementation(() => mockDetail);

  const { getByPlaceholderText } = render(<TemplateDescription />);

  expect(getByPlaceholderText('Enter title')).toHaveAttribute('value', 'Billybob!');
  expect(getByPlaceholderText('Enter detail')).toHaveTextContent('Tatata bala tu!');
});
