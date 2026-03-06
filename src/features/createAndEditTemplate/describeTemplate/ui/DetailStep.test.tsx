import { render } from '@testing-library/react';
import { useValidateTitle } from '../core/use-cases/validateTitle';
import { useValidateDetail } from '../core/use-cases/validateDetail';
import { defaultTemplateItem } from 'testingHelpers';
import DetailStep from './DetailStep';

jest.mock(
  '@src/features/createAndEditTemplate/describeTemplate/core/use-cases/validateDetail',
  () => ({
    useValidateDetail: jest.fn(),
  }),
);

jest.mock(
  '@src/features/createAndEditTemplate/describeTemplate/core/use-cases/validateTitle',
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

  const { getByPlaceholderText } = render(<DetailStep />);

  expect(getByPlaceholderText('Enter title')).toHaveAttribute('value', defaultTemplateItem.name);
  expect(getByPlaceholderText('Enter detail')).toHaveTextContent(defaultTemplateItem.description);
});
