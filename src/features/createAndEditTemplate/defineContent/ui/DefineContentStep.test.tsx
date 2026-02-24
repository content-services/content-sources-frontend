import { render } from '@testing-library/react';
import { useDefineContentApi } from '../store/DefineContentStore';
import { defaultTemplateItem, testRepositoryParamsResponse } from 'testingHelpers';
import DefineContentStep from './DefineContentStep';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';

jest.mock('@src/features/createAndEditTemplate/defineContent/store/DefineContentStore', () => ({
  useDefineContentApi: jest.fn(),
}));

jest.mock('@src/features/createAndEditTemplate/editTemplate/store/EditTemplateStore', () => ({
  useEditTemplateState: jest.fn(),
}));

it('expect DefineContentStep to render correctly', () => {
  const mockDefineContentApi = {
    templateRequest: defaultTemplateItem,
    setTemplateRequest: () => undefined,
    distribution_arches: testRepositoryParamsResponse.distribution_arches,
    distribution_versions: testRepositoryParamsResponse.distribution_versions,
    archesDisplay: () => undefined,
    versionDisplay: () => undefined,
  };
  const mockEditTemplateState = {
    isEditTemplate: false,
  };
  (useDefineContentApi as jest.Mock).mockImplementation(() => mockDefineContentApi);
  (useEditTemplateState as jest.Mock).mockImplementation(() => mockEditTemplateState);

  const { getByText } = render(<DefineContentStep />);

  const archTextBox = getByText(defaultTemplateItem.arch);

  expect(archTextBox).toBeInTheDocument();
  expect(archTextBox).not.toHaveAttribute('disabled');

  const versionTextBox = getByText('el' + defaultTemplateItem.version);

  expect(versionTextBox).toBeInTheDocument();
  expect(versionTextBox).not.toHaveAttribute('disabled');
});

it('expect DefineContentStep to render with disabled inputs', () => {
  const mockDefineContentApi = {
    templateRequest: defaultTemplateItem,
    setTemplateRequest: () => undefined,
    distribution_arches: testRepositoryParamsResponse.distribution_arches,
    distribution_versions: testRepositoryParamsResponse.distribution_versions,
    archesDisplay: () => undefined,
    versionDisplay: () => undefined,
  };
  const mockEditTemplateState = {
    isEditTemplate: true,
  };
  (useDefineContentApi as jest.Mock).mockImplementation(() => mockDefineContentApi);
  (useEditTemplateState as jest.Mock).mockImplementation(() => mockEditTemplateState);

  const { getByTestId } = render(<DefineContentStep />);

  const archTextBox = getByTestId('restrict_to_architecture');

  expect(archTextBox).toBeInTheDocument();
  expect(archTextBox).toHaveAttribute('disabled');

  const versionTextBox = getByTestId('restrict_to_os_version');

  expect(versionTextBox).toBeInTheDocument();
  expect(versionTextBox).toHaveAttribute('disabled');
});
