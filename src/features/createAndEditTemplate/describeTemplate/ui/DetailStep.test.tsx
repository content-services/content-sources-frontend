import { render } from '@testing-library/react';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { defaultTemplateItem } from 'testingHelpers';
import DetailStep from './DetailStep';

jest.mock('@src/features/createAndEditTemplate/workflow/store/TemplateStore', () => ({
  useTemplateRequestApi: jest.fn(),
  useTemplateRequestState: jest.fn(),
}));

it('expect DetailStep to render correctly', () => {
  const mockTemplateRequestApi = {
    setTitle: () => {},
    setDetail: () => {},
  };
  const mockTemplateRequestState = {
    title: defaultTemplateItem.name,
    detail: defaultTemplateItem.description,
  };

  (useTemplateRequestApi as jest.Mock).mockImplementation(() => mockTemplateRequestApi);
  (useTemplateRequestState as jest.Mock).mockImplementation(() => mockTemplateRequestState);

  const { getByPlaceholderText } = render(<DetailStep />);

  expect(getByPlaceholderText('Enter name')).toHaveAttribute('value', defaultTemplateItem.name);
  expect(getByPlaceholderText('Enter description')).toHaveTextContent(
    defaultTemplateItem.description,
  );
});
